import { Readability } from "@mozilla/readability";
import { flattenToParagraphs } from "../../utils/article";
import OpenAI from "openai";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Button } from "@/components/ui/Button";
import { summarySchema } from "../../types/content";
const client = new OpenAI({
  apiKey: import.meta.env.WXT_OPENAI_API_KEY,
  // TODO: remove this
  dangerouslyAllowBrowser: true,
});

const summaryPrompt = `# Identity

You are an {{English}} teacher who explains things vividly. Your student speaks {{Chinese}}

# Instruction

You will be given a long text. Then you should:

1. Determine if the text is a article or part of an long article or book (true or false). If the content is inconsistent and not like from one article or book, then false.
2. If the answer is yes for step 1, do the following:
   i) Find the main point of the article and exclude some irrelevant content that may mistakenly be included in the article.
   ii) Summarize the relevant text into a short summary.
   iii) The introduction before you start to explain specific parts of the content. This may include necessary background information and very short summary of the text, or anything that makes students feel interested and easily understand the article.
   iv) The specialized terminology involved in the content.
3. If the answer is no for step 1, then only return the empty text "" for the corresponding fields.

Your response should following the JSON format:

{
  "is_article": boolean,
  "summary": string, // use language {{English}}
  "introduction": string, // use language {{Chinese}}
  "terms": string[] // use language {{English}}
}


Here is an example of the expected format:

<example>
Input:
This newspaper believes in the liberal principle that people should have the right to choose the manner of their own death. So do two-thirds of Britons, who for decades have been in favour of assisted dying for those enduring unbearable suffering. And so do the citizens of many other democracies—18 jurisdictions have passed laws in the past decade.
Despite this, Westminster MPs look as if they could vote down a bill on November 29th that would introduce assisted dying into England and Wales. They would be squandering a rare chance to enrich people's fundamental liberties.
Output:
{
  "is_article": true,
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

const instruction = `
# Identity

You are a humorous and interesting English teacher.

# Instructions

* When defining variables, use snake case names (e.g. my_variable) 
  instead of camel case names (e.g. myVariable).
* To support old browsers, declare variables using the older 
  "var" keyword.
* Do not give responses with Markdown formatting, just return 
  the code as requested.

# Examples

<user_query>
How do I declare a string variable for a first name?
</user_query>

<assistant_response>
var first_name = "Anna";
</assistant_response>
`;

export default function Content() {
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [response, setResponse] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const generateResponse = async () => {
      const documentClone = document.cloneNode(true);
      const article = new Readability(documentClone as Document, {
        serializer: (el) => el,
      }).parse();

      if (article?.content) {
        const paragraphs = flattenToParagraphs(article.content);
        setParagraphs(paragraphs);

        // const response = await client.responses.create({
        //   model: "gpt-4.1-mini",
        //   instructions: summaryPrompt,
        //   input: paragraphs.join("\n"),
        // });
        // console.log("response", response.output_text);
        // setResponse(response.output_text);
      }
    };
    generateResponse();
  }, []);

  const handleReadForMe = async () => {
    console.log("start to read for me");
    setIsLoading(true);
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions: summaryPrompt,
      input: paragraphs.join("\n"),
    });

    const summary = summarySchema.parse(JSON.parse(response.output_text));
    console.log("summary", summary);
    setIsLoading(false);
  };

  return (
    <div>
      {paragraphs.length > 0 ? (
        paragraphs.map((paragraph: string, index: number) => (
          <p key={index} className="text-sm mb-2">
            {paragraph}
            <Button
              className="ring-1 ring-offset-2 ring-primary"
              onClick={handleReadForMe}
            >
              Read For Me
            </Button>
          </p>
        ))
      ) : (
        <div className="flex h-full w-full justify-center items-center">
          <Button
            className="ring-1 ring-offset-2 ring-primary"
            onClick={handleReadForMe}
          >
            Read For Me
          </Button>
        </div>
      )}
    </div>
  );
}
