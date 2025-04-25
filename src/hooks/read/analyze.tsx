import {
  ExtractedContent,
  ArticleAnalysis,
  articleAnalysisSchema,
} from "@/types/content";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { openai } from "@/utils/openai";
import { useAtom, useSetAtom } from "jotai";
import { explainAtom, requestContinueAtom } from "@/entrypoints/content/atoms";
import { zodTextFormat } from "openai/helpers/zod";
import {
  langCodeISO6393,
  LangCodeISO6393,
  langCodeToEnglishName,
} from "@/types/languages";

const getAnalyzePrompt = (targetLang: string) => `# Identity

You are an language teacher who explains things vividly. Your student speaks ${targetLang}

# Instruction

You will be given json object. 

{
  "originalTitle": string | undefined | null,
  "content": string,
}

Then you should analyze the content:

1. Determine if the content is a article or part of an long article or book (true or false). If the content is inconsistent and not like from one article or book, then false.
2. If the answer is yes for step 1, do the following:
   i) Find the main point of the article and exclude some irrelevant content that may mistakenly be included in the article.
   ii) Detect the language of the relevant content and return the language as "detectedLang".
   iii) Summarize the relevant text into a short summary.
   iv) The introduction in ${targetLang} before you start to explain specific parts of the content. This may include necessary background information and very short summary of the text, or anything that makes students feel interested and easily understand the article.
   v) The specialized terminology involved in the content.
3. If the answer is no for step 1, then only return the empty text "" for the corresponding fields.

Your response should following the JSON format:

{
  "isArticle": boolean,
  "detectedLang": string, // ISO 639-3 language code subset, if not in the subset, return "und"
  "summary": string, // in "detectedLang"
  "introduction": string, // in language ${targetLang} for your student
  "terms": string[] // in "detectedLang"
}

ISO 639-3 language code subset:
${JSON.stringify(langCodeISO6393)}

Here is an example of the expected format when English teacher teach a Chinese student:

<example>
Input:
{
  "originalTitle": "Why British MPs should vote for assisted dying",
  "content": "This newspaper believes in the liberal principle that people should have the right to choose the manner of their own death. So do two-thirds of Britons, who for decades have been in favour of assisted dying for those enduring unbearable suffering. And so do the citizens of many other democracies—18 jurisdictions have passed laws in the past decade.
Despite this, Westminster MPs look as if they could vote down a bill on November 29th that would introduce assisted dying into England and Wales. They would be squandering a rare chance to enrich people's fundamental liberties.",
}
Output:
{
  "isArticle": true,
  "detectedLang": "eng",
  "summary": "The piece contends that although a large majority of Britons—and many other democracies—support assisted dying, Members of Parliament in Westminster appear ready to reject a November 29th bill that would legalise it in England and Wales, thereby forfeiting an opportunity to broaden personal liberties.",
  "introduction": "这段文字摘自一篇讨论"协助死亡"（assisted dying）立法的社论。英国公众长期支持这种做法，并指出全球已有多地通过相关法律；随后英国议会让英格兰和威尔士合法化协助死亡的提案。我们一起来通过这篇文章了解——个人自主权与立法进程之间的张力吧。",
  "terms": [
    "assisted dying",
    "liberal principle",
    "Westminster MPs",
    "bill",
    "fundamental liberties",
    "jurisdictions"
  ]
}
</example>

Please return the response as JSON format directly.
`;

export function useAnalyzeContent() {
  // const { mutate: generateExplanation } = useExplainArticle();
  const [{ mutate: generateExplanation }] = useAtom(explainAtom);
  const setRequestContinue = useSetAtom(requestContinueAtom);

  return useMutation<ArticleAnalysis, Error, ExtractedContent>({
    mutationFn: async (extractedContent: ExtractedContent) => {
      if (!extractedContent.paragraphs.length) {
        throw new Error("No content available for summary generation");
      }

      let attempts = 0;
      const maxAttempts = 3;
      let lastError;

      const targetLangCode = await storage.getItem<LangCodeISO6393>(
        "local:readBuddy_targetLangCode"
      );

      if (!targetLangCode) {
        throw new Error("No target language selected");
      }

      const targetLang = langCodeToEnglishName[targetLangCode];

      console.log("targetLang", targetLang);

      while (attempts < maxAttempts) {
        try {
          const response = await openai.responses.parse({
            model: "gpt-4.1-mini",
            instructions: getAnalyzePrompt(targetLang),
            input: JSON.stringify({
              originalTitle: extractedContent.article.title,
              content: extractedContent.paragraphs.join("\n").trim(),
            }),
            text: {
              format: zodTextFormat(articleAnalysisSchema, "articleAnalysis"),
            },
          });
          const articleAnalysis = articleAnalysisSchema.parse(
            JSON.parse(response.output_text)
          );

          storage.setItem(
            "local:readBuddy_detectedLangCode",
            articleAnalysis.detectedLang === "und"
              ? "cmn"
              : articleAnalysis.detectedLang
          );

          return articleAnalysis;
        } catch (error) {
          lastError = error;
          console.warn(
            `Summary generation attempt ${attempts + 1} failed:`,
            error
          );
          attempts++;
        }
      }

      throw lastError;
    },
    onSuccess: (data, variables) => {
      console.log("articleAnalysis", data);
      if (data.isArticle) {
        generateExplanation({
          extractedContent: variables,
          articleAnalysis: data,
        });
        console.log("after calling generateExplanation");
      } else {
        setRequestContinue(true);
      }
    },
    onError: () => {
      console.log("failed to analyze the content");
      toast.error("Failed to analyze the content");
    },
  });
}
