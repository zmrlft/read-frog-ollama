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

const getAnalyzePrompt = (
  originalLang: string,
  targetLang: string
) => `# Identity

You are an ${originalLang} teacher who explains things vividly. Your student speaks ${targetLang}

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
   ii) Summarize the relevant text into a short summary.
   iii) If the originalTitle is not null and in ${originalLang}, keep it. Otherwise, generate a title for the article in ${targetLang}.
   iv) Translate the title you generated in step iii to ${targetLang} as "translatedTitle".
   v) The introduction before you start to explain specific parts of the content. This may include necessary background information and very short summary of the text, or anything that makes students feel interested and easily understand the article.
   vi) The specialized terminology involved in the content.
3. If the answer is no for step 1, then only return the empty text "" for the corresponding fields.

Your response should following the JSON format:

{
  "isArticle": boolean,
  "originalTitle": string, // use language ${originalLang}
  "translatedTitle": string, // use language ${targetLang}
  "summary": string, // use language ${originalLang}
  "introduction": string, // use language ${targetLang}
  "terms": string[] // use language ${originalLang}
}


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
  "originalTitle": "Why British MPs should vote for assisted dying",
  "translatedTitle": "为什么英国议员应该投票支持协助死亡",
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

      while (attempts < maxAttempts) {
        try {
          console.log("extractedContent", extractedContent);
          const response = await openai.responses.parse({
            model: "gpt-4.1-mini",
            instructions: getAnalyzePrompt(
              // TODO: default to user's selected language
              extractedContent.article.lang ?? "English",
              "Chinese"
            ),
            input: JSON.stringify({
              originalTitle: extractedContent.article.title,
              content: extractedContent.paragraphs.join("\n").trim(),
            }),
            text: {
              format: zodTextFormat(articleAnalysisSchema, "articleAnalysis"),
            },
          });
          return articleAnalysisSchema.parse(JSON.parse(response.output_text));
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
      toast.error("Failed to analyze the content");
    },
  });
}
