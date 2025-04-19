import { Readability } from "@mozilla/readability";
import { flattenToParagraphs } from "../../utils/article";

export default function Content() {
  const [paragraphs, setParagraphs] = useState<string[]>([]);

  useEffect(() => {
    const documentClone = document.cloneNode(true);
    const article = new Readability(documentClone as Document, {
      serializer: (el) => el,
    }).parse();

    console.log("content: ", article?.content);

    if (article?.content) {
      setParagraphs(flattenToParagraphs(article.content));
    }
  }, []);

  return (
    <div>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="text-sm mb-2">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
