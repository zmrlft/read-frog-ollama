import {
  ExtractedContent,
  ArticleExplanation,
  ArticleAnalysis,
  articleExplanationSchema,
} from "@/types/content";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { openai } from "@/utils/openai";

type ExplainArticleParams = {
  extractedContent: ExtractedContent;
  articleAnalysis: ArticleAnalysis;
};

const MAX_ATTEMPTS = 3;

const getExplainPrompt = (
  originalLang: string,
  targetLang: string
) => `# Identity

You are an ${originalLang} teacher who explains things vividly. Your student speaks ${targetLang}

# Instruction

You will be given json object. 

{
  "overallSummary": string,
  "paragraphs": string[],
}

For each paragraph, you should:

1. Determine if the paragraph is related to the overall summary.
2. If the answer is yes for step 1, do the following:
   i) Split the paragraph into sentences.
   ii) For each sentence, do the following:
      a) Translate the sentence to ${targetLang}.
      b) If there are wonderful or interesting words, phrases, or technical terms in the sentence, please explain their part of speech and how to understand them in context.
      c) Explain the sentence to your student. First, you need to translate the sentence, then explain the words, phrases and whole sentences you obtained above in a vivid and coherent manner. If necessary, you can incorporate context, give examples, or reference classical texts to engage students' interest and aid understanding.
3. If the answer is no for step 1, then only return the empty text "" for the corresponding fields.

Your response should following the JSON format:

{
  "newPartSummary": string, // use language ${originalLang}
  "paragraphs": {
    "originalSentence": string,
    "translatedSentence": string, // use language ${targetLang}
    "words": {
      "word": string,
      "partOfSpeech": string,
      "explanation": string, // explain the word, use language ${targetLang}
      }[], // words, phrases, technical terms
    "explanation": string, // use language ${targetLang}
  }[][], // 1-dimensional means paragraph, 2-dimensional means sentence
}

Here is an example of the expected format when English teacher teach a Chinese student:

<example>
Input:
{
  "overallSummary": "The piece contends that although a large majority of Britons—and many other democracies—support assisted dying, Members of Parliament in Westminster appear ready to reject a November 29th bill that would legalise it in England and Wales, thereby forfeiting an opportunity to broaden personal liberties.",
  "paragraphs": [
    "This newspaper believes in the liberal principle that people should have the right to choose the manner of their own death. So do two-thirds of Britons, who for decades have been in favour of assisted dying for those enduring unbearable suffering. And so do the citizens of many other democracies—18 jurisdictions have passed laws in the past decade.",
    "A cookie (also known as a web cookie or browser cookie) is a small piece of data a server sends to a user's web browser. The browser may store cookies, create new cookies, modify existing ones, and send them back to the same server with later requests.",
    "Despite this, Westminster MPs look as if they could vote down a bill on November 29th that would introduce assisted dying into England and Wales. They would be squandering a rare chance to enrich people's fundamental liberties.",
  ]
}
Output:
{
  "paragraphs": [
    [
      {
        "originalSentence": "This newspaper believes in the liberal principle that people should have the right to choose the manner of their own death.",
        "translatedSentence": "该报纸秉持自由主义原则，认为人们应该拥有选择自己死亡方式的权利。",
        "words": [
          {
            "word": "liberal principle",
            "partOfSpeech": "noun phrase",
            "explanation": "'自由主义原则'，来源于西方政治思想，强调个体自主与个人自由。"
          },
          {
            "word": "manner",
            "partOfSpeech": "noun",
            "explanation": "'方式'，指做事的具体方法或形式，在此特指'死亡的方式'。"
          },
          {
            "word": "right",
            "partOfSpeech": "noun",
            "explanation": "'权利'，法律或道德上被认可和保护的自由或特权。"
          }
        ],
        "explanation": "这句话说该报纸支持自由主义的核心价值——个人应有权决定自己生命的终结方式。想象一下，正如密尔在《论自由》中强调的：任何一个人的自由，只要不伤害他人，就应受到最大程度的尊重。这里，将'选择死亡方式'视为最极端的人生权利，是对重症患者尊严的终极关怀，让他们在无法忍受痛苦时，依然保有自主。"
      }
    ]
  ]
}
</example>

Please return the response as JSON format directly.
`;

const explainBatch = async (
  batch: string[],
  extractedContent: ExtractedContent,
  articleAnalysis: ArticleAnalysis
) => {
  let attempts = 0;
  let lastError;

  while (attempts < MAX_ATTEMPTS) {
    try {
      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        instructions: getExplainPrompt(
          // TODO: default to user's selected language
          extractedContent.article.lang ?? "English",
          "Chinese"
        ),
        input: JSON.stringify({
          overallSummary: articleAnalysis.summary,
          paragraphs: batch,
        }),
      });

      const parsedResponse = JSON.parse(response.output_text);
      console.log("parsedResponse", parsedResponse);
      return articleExplanationSchema.parse(parsedResponse);
    } catch (error) {
      lastError = error;
      console.warn(
        `Explanation generation for batch attempt ${attempts + 1} failed:`,
        error
      );
      attempts++;
    }
  }

  throw lastError;
};

export function useExplainArticle() {
  return useMutation<
    ArticleExplanation["paragraphs"],
    Error,
    ExplainArticleParams
  >({
    // The explanation mutation key ensures the same mutation is used across components
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
      // TODO: max 4 paragraphs or max 1200 characters
      const batchSize = 4;
      const batches = [];

      for (let i = 0; i < paragraphs.length; i += batchSize) {
        batches.push(paragraphs.slice(i, i + batchSize));
      }

      console.log("batches length", batches.length);
      console.log("batches", batches);

      const allParagraphExplanations = await sendInBatchesWithFixedDelay(
        batches.map((batch) =>
          explainBatch(batch, extractedContent, articleAnalysis)
        )
      );

      const flattenedParagraphExplanations = allParagraphExplanations
        .map((explanation) => explanation.paragraphs)
        .flat();

      console.log(
        "flattenedParagraphExplanations",
        flattenedParagraphExplanations
      );

      return flattenedParagraphExplanations;
    },
    onSuccess: (data) => {
      console.log("explanation", data);
    },
    onError: (error) => {
      toast.error("Failed to generate the explanation");
      console.error("Failed to generate the explanation:", error);
    },
  });
}
