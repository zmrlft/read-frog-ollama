import {
  ExtractedContent,
  ArticleExplanation,
  ArticleAnalysis,
  articleExplanationSchema,
} from "@/types/content";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { openai } from "@/utils/openai";
import { zodTextFormat } from "openai/helpers/zod.mjs";
import { progressAtom, store } from "@/entrypoints/content/atoms";

type ExplainArticleParams = {
  extractedContent: ExtractedContent;
  articleAnalysis: ArticleAnalysis;
};

const MAX_ATTEMPTS = 3;
const MAX_CHARACTERS = 2000;
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
      a) If there is orthographic or typographical error in the original sentence, please fix it.
      b) Translate the sentence to ${targetLang}.
      c) If there are wonderful or interesting words, phrases, or technical terms in the sentence, please explain their part of speech and how to understand them in context.
      d) Explain the sentence to your student. First, you need to translate the sentence, then explain the words, phrases and whole sentences you obtained above in a vivid and coherent manner. If necessary, you can incorporate context, give examples, or reference classical texts to engage students' interest and aid understanding.
3. If the answer is no for step 1, then don't include the paragraph in your response.

Your response should following the JSON format:

{
  "paragraphs": {
    "originalSentence": string, // fixed version of the original sentence
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
    "T his newspaper believes in the liberal principle that people should have the right to choose the manner of their own death. So do two-thirds of Britons, who for decades have been in favour of assisted dying for those enduring unbearable suffering. And so do the citizens of many other democracies—18 jurisdictions have passed laws in the past decade.",
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
        "translatedSentence": "本报坚信自由主义原则——人们应当拥有选择自己死亡方式的权利。",
        "words": [
          { "word": "liberal", "partOfSpeech": "adj.", "explanation": "政治语境中的“自由主义的”，强调个人自由、减少国家干预。" },
          { "word": "manner", "partOfSpeech": "n.", "explanation": "方式、方法；此处特指“死亡的方式”。" }
        ],
        "explanation": "本句开宗明义：报社以自由主义为基调，主张个体应自主决定“死亡方式”。“liberal principle” 与 “have the right to” 共同强化个人自由这一主题。"
      },
      {
        "originalSentence": "So do two-thirds of Britons, who for decades have been in favour of assisted dying for those enduring unbearable suffering.",
        "translatedSentence": "三分之二的英国人也持同样观点，数十年来一直支持为忍受难以承受痛苦的人提供协助死亡。",
        "words": [
          { "word": "So do", "partOfSpeech": "v.", "explanation": "倒装结构，表示“……也如此”，语气简洁有力。" },
          { "word": "two-thirds", "partOfSpeech": "num.", "explanation": "三分之二，说明压倒性多数。" },
          { "word": "enduring", "partOfSpeech": "v.", "explanation": "持续忍受；突出痛苦的持久性。" },
        ],
        "explanation": "使用“So do”倒装突出英国民众与报社立场一致。“for decades”强调支持态度之长久；“assisted dying”点明政策焦点。"
      },
      {
        "originalSentence": "And so do the citizens of many other democracies—18 jurisdictions have passed laws in the past decade.",
        "translatedSentence": "其他许多民主国家的公民也持此观点——过去十年已有 18 个司法辖区通过了相关法律。",
        "words": [
          { "word": "democracies", "partOfSpeech": "n.", "explanation": "民主国家；复数形式强调范围广泛。" },
          { "word": "jurisdictions", "partOfSpeech": "n.", "explanation": "司法辖区；侧重不同地区独立立法权。" },
        ],
        "explanation": "再次用倒装“So do”扩展到国际层面，破折号后的数据提供权威论据，增强说服力。"
      }
    ],
    [
      {
        "originalSentence": "Despite this, Westminster MPs look as if they could vote down a bill on November 29th that would introduce assisted dying into England and Wales.",
        "translatedSentence": "尽管如此，威斯敏斯特的议员似乎可能在 11 月 29 日否决一项旨在于英格兰和威尔士实行协助死亡的法案。",
        "words": [
          { "word": "Westminster MPs", "partOfSpeech": "n.", "explanation": "英国下议院议员，象征立法权力核心。" },
          { "word": "vote down", "partOfSpeech": "v.", "explanation": "投票否决；由动词 + 副词构成的短语动词。" },
          { "word": "bill", "partOfSpeech": "n.", "explanation": "议案、法案；尚未正式成为法律的提案。" },
        ],
        "explanation": "“Despite”开头体现公众意见与政治现实的对立；“vote down”揭示潜在结果，日期“November 29th”强调紧迫性。"
      },
      {
        "originalSentence": "They would be squandering a rare chance to enrich people's fundamental liberties.",
        "translatedSentence": "他们将浪费一次增进人们基本自由的难得机会。",
        "words": [
          { "word": "squander", "partOfSpeech": "v.", "explanation": "挥霍、浪费；贬义极强，指不珍惜宝贵资源。" },
          { "word": "fundamental liberties", "partOfSpeech": "n.", "explanation": "基本自由；核心公民权利与自由。" }
        ],
        "explanation": "动词“squander”形象地批评议员的选择，“fundamental liberties”呼应自由主义主题，强调立法决策的深远影响。"
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
      const response = await openai.responses.parse({
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
        text: {
          format: zodTextFormat(articleExplanationSchema, "articleExplanation"),
        },
      });

      const parsedResponse = JSON.parse(response.output_text);
      console.log("parsedResponse", parsedResponse);
      const articleExplanation = articleExplanationSchema.parse(parsedResponse);
      store.set(progressAtom, (prev) => ({
        ...prev,
        completed: prev.completed + 1,
      }));
      return articleExplanation;
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

export const mutationFn = async (params: ExplainArticleParams) => {
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

  console.log("flattenedParagraphExplanations", flattenedParagraphExplanations);

  return flattenedParagraphExplanations;
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
