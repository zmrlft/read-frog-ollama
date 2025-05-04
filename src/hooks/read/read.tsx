import {
  progressAtom,
  readStateAtom,
  store,
} from "@/entrypoints/content/atoms";
import {
  ArticleAnalysis,
  articleAnalysisSchema,
  ArticleExplanation,
  articleExplanationSchema,
  ExtractedContent,
} from "@/types/content";
import {
  LangCodeISO6393,
  langCodeToEnglishName,
  LangLevel,
} from "@/types/languages";
import { ProviderConfig, Provider } from "@/types/provider";
import { getAnalyzePrompt } from "@/utils/prompts/analyze";
import { getExplainPrompt } from "@/utils/prompts/explain";
import { useMutation } from "@tanstack/react-query";
import { generateObject } from "ai";
import { useSetAtom } from "jotai";

type ExplainArticleParams = {
  extractedContent: ExtractedContent;
  articleAnalysis: ArticleAnalysis;
};

const MAX_ATTEMPTS = 3;
const MAX_CHARACTERS = 1500;

export function useAnalyzeContent() {
  const setReadState = useSetAtom(readStateAtom);
  return useMutation<ArticleAnalysis, Error, ExtractedContent>({
    mutationKey: ["analyzeContent"],
    mutationFn: async (extractedContent: ExtractedContent) => {
      if (!extractedContent.paragraphs.length) {
        throw new Error("No content available for summary generation");
      }

      let attempts = 0;
      const maxAttempts = 3;
      let lastError;

      const provider = await storage.getItem<Provider>("local:provider");
      const providerConfig = await storage.getItem<ProviderConfig>(
        "local:providerConfig"
      );
      if (!provider || !providerConfig) {
        throw new Error("No provider config");
      }
      const model = providerConfig[provider].model;

      const targetLangCode = await storage.getItem<LangCodeISO6393>(
        "local:targetLangCode"
      );

      if (!targetLangCode || !model) {
        throw new Error("No target language or model selected");
      }

      const targetLang = langCodeToEnglishName[targetLangCode];
      const providerRegistry = await getProviderRegistry();

      while (attempts < maxAttempts) {
        try {
          const { object: articleAnalysis } = await generateObject({
            model: providerRegistry.languageModel(`${provider}:${model}`),
            system: getAnalyzePrompt(targetLang),
            prompt: JSON.stringify({
              originalTitle: extractedContent.article.title,
              content: extractedContent.paragraphs.join("\n"),
            }),
            schema: articleAnalysisSchema,
          });

          // TODO: if und, then UI need to show UI to ask user to select the language or not continue
          storage.setItem(
            "local:detectedLangCode",
            articleAnalysis.detectedLang === "und"
              ? "cmn"
              : articleAnalysis.detectedLang
          );
          // console.log("articleAnalysis", articleAnalysis);
          return articleAnalysis;
        } catch (error) {
          lastError = error;
          attempts++;
        }
      }

      throw lastError;
    },
    onError: () => {
      setReadState(undefined);
    },
  });
}

const explainBatch = async (
  batch: string[],
  articleAnalysis: ArticleAnalysis
) => {
  let attempts = 0;
  let lastError;

  const targetLangCode = await storage.getItem<LangCodeISO6393>(
    "local:targetLangCode"
  );
  const sourceLangCode = await storage.getItem<LangCodeISO6393 | "auto">(
    "local:sourceLangCode"
  );
  const detectedLangCode = await storage.getItem<LangCodeISO6393>(
    "local:detectedLangCode"
  );
  const langLevel = await storage.getItem<LangLevel>("local:langLevel");

  if (!targetLangCode || !sourceLangCode || !detectedLangCode) {
    throw new Error("Incomplete language settings");
  }

  const targetLang = langCodeToEnglishName[targetLangCode];
  const sourceLang =
    langCodeToEnglishName[
      sourceLangCode === "auto" ? detectedLangCode : sourceLangCode
    ];

  const provider = await storage.getItem<Provider>("local:provider");
  const providerConfig = await storage.getItem<ProviderConfig>(
    "local:providerConfig"
  );
  if (!provider || !providerConfig) {
    throw new Error("No provider config");
  }
  const model = providerConfig[provider].model;

  if (!model) {
    throw new Error("No model selected");
  }

  const providerRegistry = await getProviderRegistry();
  while (attempts < MAX_ATTEMPTS) {
    try {
      const { object: articleExplanation } = await generateObject({
        model: providerRegistry.languageModel(`${provider}:${model}`),
        system: getExplainPrompt(
          sourceLang,
          targetLang,
          langLevel ?? "intermediate"
        ),
        prompt: JSON.stringify({
          overallSummary: articleAnalysis.summary,
          paragraphs: batch,
        }),
        schema: articleExplanationSchema,
      });

      store.set(progressAtom, (prev) => ({
        ...prev,
        completed: prev.completed + 1,
      }));
      return articleExplanation;
    } catch (error) {
      lastError = error;
      // console.error("error, batch, attempts", batch, attempts, error);
      attempts++;
    }
  }

  throw lastError;
};

export function useExplainArticle() {
  const setReadState = useSetAtom(readStateAtom);
  return useMutation<
    ArticleExplanation["paragraphs"],
    Error,
    ExplainArticleParams
  >({
    mutationKey: ["explainArticle"],
    mutationFn: async (params: ExplainArticleParams) => {
      const { extractedContent, articleAnalysis } = params;
      if (!extractedContent?.paragraphs.length || !articleAnalysis) {
        throw new Error(
          "No content or summary available for explanation generation"
        );
      }

      // Process paragraphs in batches of 3
      const paragraphs = extractedContent.paragraphs;
      const batches = [];

      // if cur > 1200 or prev + cur > 1200, then push prev to batches, clear prev
      // if cur > 1200, push the cur to batches
      // else push cur to prev
      // last push prev to batches

      let prevParagraphs: string[] = [];
      let prevParagraphsLength = 0;
      for (let i = 0; i < paragraphs.length; i++) {
        if (prevParagraphsLength + paragraphs[i].length > MAX_CHARACTERS) {
          batches.push(prevParagraphs);
          prevParagraphs = [];
          prevParagraphsLength = 0;
        }
        if (paragraphs[i].length > MAX_CHARACTERS) {
          batches.push([paragraphs[i]]);
        } else {
          prevParagraphs.push(paragraphs[i]);
          prevParagraphsLength += paragraphs[i].length;
        }
      }
      if (prevParagraphs.length > 0) {
        batches.push(prevParagraphs);
      }

      store.set(progressAtom, {
        completed: 0,
        total: batches.length,
      });

      // console.log("batches length", batches.length);
      // console.log("batches", batches);

      const allParagraphExplanations = await sendInBatchesWithFixedDelay(
        batches.map((batch) => explainBatch(batch, articleAnalysis))
      );

      const flattenedParagraphExplanations = allParagraphExplanations
        .map((explanation) => explanation.paragraphs)
        .flat();

      return flattenedParagraphExplanations;
    },
    onError: () => {
      setReadState(undefined);
    },
  });
}

export function useReadArticle() {
  const analyzeContent = useAnalyzeContent();
  const explainArticle = useExplainArticle();
  const setReadState = useSetAtom(readStateAtom);

  const mutate = async (extractedContent: ExtractedContent) => {
    setReadState("analyzing");
    const articleAnalysis = await analyzeContent.mutateAsync(extractedContent);
    setReadState("continue?");
    if (articleAnalysis.isArticle) {
      setReadState("explaining");
      await explainArticle.mutateAsync({
        extractedContent,
        articleAnalysis,
      });
      setReadState(undefined);
    }
  };

  return {
    mutate,
    analyzeContent,
    explainArticle,
  };
}
