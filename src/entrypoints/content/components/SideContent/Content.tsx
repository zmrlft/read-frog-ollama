import { Readability } from "@mozilla/readability";
import { flattenToParagraphs } from "../../utils/article";
import OpenAI from "openai";
import { Button } from "@/components/ui/Button";
import { summarySchema } from "../../types/content";
import { useQuery, useMutation } from "@tanstack/react-query";
import { franc } from "franc-min";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { toast } from "sonner";

const client = new OpenAI({
  apiKey: import.meta.env.WXT_OPENAI_API_KEY,
  // TODO: remove this
  dangerouslyAllowBrowser: true,
});

const getSummaryPrompt = (
  originalLang: string,
  targetLang: string
) => `# Identity

You are an ${originalLang} teacher who explains things vividly. Your student speaks ${targetLang}

# Instruction

You will be given json object. 

{
  "original_title": string | undefined | null,
  "content": string,
}

Then you should:

1. Determine if the content is a article or part of an long article or book (true or false). If the content is inconsistent and not like from one article or book, then false.
2. If the answer is yes for step 1, do the following:
   i) Find the main point of the article and exclude some irrelevant content that may mistakenly be included in the article.
   ii) Summarize the relevant text into a short summary.
   iii) If the original_title is not null and in ${originalLang}, keep it. Otherwise, generate a title for the article in ${targetLang}.
   iv) Translate the title you generated in step iii to ${targetLang} as "translated_title".
   v) The introduction before you start to explain specific parts of the content. This may include necessary background information and very short summary of the text, or anything that makes students feel interested and easily understand the article.
   vi) The specialized terminology involved in the content.
3. If the answer is no for step 1, then only return the empty text "" for the corresponding fields.

Your response should following the JSON format:

{
  "is_article": boolean,
  "original_title": string, // use language ${originalLang}
  "translated_title": string, // use language ${targetLang}
  "summary": string, // use language ${originalLang}
  "introduction": string, // use language ${targetLang}
  "terms": string[] // use language ${originalLang}
}


Here is an example of the expected format:

<example>
Input:
{
  "original_title": "Why British MPs should vote for assisted dying",
  "content": "This newspaper believes in the liberal principle that people should have the right to choose the manner of their own death. So do two-thirds of Britons, who for decades have been in favour of assisted dying for those enduring unbearable suffering. And so do the citizens of many other democracies—18 jurisdictions have passed laws in the past decade.
Despite this, Westminster MPs look as if they could vote down a bill on November 29th that would introduce assisted dying into England and Wales. They would be squandering a rare chance to enrich people's fundamental liberties.",
}
Output:
{
  "is_article": true,
  "original_title": "Why British MPs should vote for assisted dying",
  "translated_title": "为什么英国议员应该投票支持协助死亡",
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

export default function Content() {
  // Use React Query to fetch and parse the article content
  const { data: content } = useQuery({
    queryKey: ["articleContent"],
    queryFn: async () => {
      const documentClone = document.cloneNode(true);
      const article = new Readability(documentClone as Document, {
        serializer: (el) => el,
      }).parse();
      const paragraphs = article?.content
        ? flattenToParagraphs(article.content)
        : [];

      // await 10 seconds
      await new Promise((resolve) => setTimeout(resolve, 1000000));

      return {
        article: {
          ...article,
          lang: article?.textContent
            ? franc(article?.textContent)
            : article?.lang,
        },
        paragraphs,
      };
    },
    // staleTime: Infinity, // Only run once per page load
  });

  // Use React Query mutation for OpenAI API call
  const {
    mutate: generateSummary,
    isPending: isGeneratingSummary,
    data: summary,
  } = useMutation({
    mutationFn: async () => {
      if (!content || !content.paragraphs.length) {
        throw new Error("No content available for summary generation");
      }

      let attempts = 0;
      const maxAttempts = 3;
      let lastError;

      while (attempts < maxAttempts) {
        try {
          const response = await client.responses.create({
            model: "gpt-4.1-mini",
            instructions: getSummaryPrompt(
              // TODO: default to user's selected language
              content.article.lang ?? "English",
              "Chinese"
            ),
            input: JSON.stringify({
              original_title: content.article.title,
              content: content.paragraphs.join("\n").trim(),
            }),
          });
          return summarySchema.parse(JSON.parse(response.output_text));
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
    onSuccess: (data) => {
      console.log("summary", data);
      if (data.isArticle) {
        generateExplanation();
      }
    },
    onError: (error) => {
      toast.error("Failed to analyze the content");
      console.error("Failed to analyze the content:", error);
    },
  });

  const {
    mutate: generateExplanation,
    isPending: isGeneratingExplanation,
    data: explanation,
  } = useMutation({
    mutationFn: async () => {
      return "explanation";
    },
  });

  const handleReadForMe = () => {
    console.log("start to read for me");
    if (!content?.paragraphs.join("\n").trim()) {
      toast.error("Cannot read the content: content is not available");
      return;
    }
    generateSummary();
  };

  return (
    <>
      {explanation ? (
        <ScrollArea className="flex-1 h-full p-2">
          {content?.paragraphs.map((paragraph: string, index: number) => (
            <p key={index} className="text-sm mb-2">
              {paragraph}
              <Button onClick={handleReadForMe} disabled={isGeneratingSummary}>
                {isGeneratingSummary ? "Generating..." : "Read For Me"}
              </Button>
            </p>
          ))}
        </ScrollArea>
      ) : (
        <div className="flex-1 flex h-full w-full justify-center items-center">
          {isGeneratingSummary || isGeneratingExplanation ? (
            <div>{isGeneratingSummary ? "Analyzing..." : "Generating..."}</div>
          ) : !summary ? (
            <Button onClick={handleReadForMe} disabled={isGeneratingSummary}>
              Read For Me
            </Button>
          ) : (
            <div>
              Are you sure to continue?
              <Button onClick={() => generateExplanation()}>Continue</Button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
