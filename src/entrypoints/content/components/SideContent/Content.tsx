import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { toast } from "sonner";
import Explanation from "./Explanation";
import { useExtractContent } from "@/hooks/read/extract";
import { useAtomValue } from "jotai";
import { progressAtom, readStateAtom } from "../../atoms";
import LoadingDots from "@/components/LoadingDots";
import { Progress } from "@/components/ui/Progress";
import { useReadArticle } from "@/hooks/read/read";

export default function Content() {
  const progress = useAtomValue(progressAtom);
  const readState = useAtomValue(readStateAtom);
  const { isPending: isExtractingContent, data: extractedContent } =
    useExtractContent();
  const { mutate: readArticle, explainArticle } = useReadArticle();

  const handleReadForMe = () => {
    if (!extractedContent?.paragraphs.join("\n").trim()) {
      toast.error("Cannot read the content: content is not available");
      return;
    }
    readArticle(extractedContent);
  };

  const handleContinue = () => {
    if (extractedContent) {
      // TODO: useExplainArticle 但是要获得最新的这个 mutate 的返回结果：https://github.com/jotaijs/jotai-tanstack-query#atomwithmutationstate-usage
      // readArticle(extractedContent);
    } else {
      toast.error("Cannot generate the explanation: content is not available");
    }
  };

  if (isExtractingContent) {
    return (
      <div className="flex-1 flex h-full w-full justify-center items-center p-4 gap-x-2">
        <LoadingDots />
        Extracting content...
      </div>
    );
  }

  if (readState === "analyzing") {
    return (
      <div className="flex-1 flex h-full w-full justify-center items-center p-4 gap-x-2">
        <LoadingDots />
        Analyzing...
      </div>
    );
  }

  if (readState === "continue?") {
    return (
      <div className="flex-1 flex h-full w-full justify-center items-center p-4 gap-x-2">
        <div className="flex flex-col gap-6">
          <p>
            The content does not appear to be an article or book. Are you sure
            you want to proceed?
          </p>
          <Button className="mx-auto" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      </div>
    );
  }

  if (readState === "explaining") {
    return (
      <div className="flex-1 flex h-full w-full justify-center items-center p-4 gap-x-2">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <LoadingDots />
            Generating...
          </div>
          <Progress
            value={
              progress.total !== 0
                ? (progress.completed / progress.total) * 100
                : 0
            }
          />
        </div>
      </div>
    );
  }
  return (
    <>
      {explainArticle.data ? (
        <ScrollArea className="flex-1 h-full">
          <Explanation articleExplanation={explainArticle.data} />
        </ScrollArea>
      ) : (
        <div className="flex-1 flex h-full w-full justify-center items-center p-4">
          <Button onClick={handleReadForMe}>Read For Me</Button>
        </div>
      )}
    </>
  );
}
