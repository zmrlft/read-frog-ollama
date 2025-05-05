import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { toast } from "sonner";
import Explanation from "./Explanation";
import { useExtractContent } from "@/hooks/read/extract";
import { useAtom, useAtomValue } from "jotai";
import { progressAtom, readStateAtom } from "../../atoms";
import LoadingDots from "@/components/LoadingDots";
import { Progress } from "@/components/ui/Progress";
import { useExplainArticle, useReadArticle } from "@/hooks/read/read";
import { useMutationState } from "@tanstack/react-query";
import { ArticleExplanation } from "@/types/content";

export default function Content() {
  const progress = useAtomValue(progressAtom);
  const [readState, setReadState] = useAtom(readStateAtom);
  const { isPending: isExtractingContent, data: extractedContent } =
    useExtractContent();
  const { mutate: readArticle, analyzeContent } = useReadArticle();
  const { mutate: explainArticle } = useExplainArticle();

  const explainData = useMutationState({
    filters: {
      mutationKey: ["explainArticle"],
    },
    select: (mutation) => mutation.state.data,
  });

  const handleReadForMe = () => {
    if (!extractedContent?.paragraphs.join("\n").trim()) {
      toast.error("Cannot read the content: content is not available");
      return;
    }
    readArticle(extractedContent);
  };

  const handleContinue = () => {
    if (extractedContent && analyzeContent.data) {
      // TODO: useExplainArticle 但是要获得最新的这个 mutate 的返回结果：https://github.com/jotaijs/jotai-tanstack-query#atomwithmutationstate-usage
      explainArticle({
        extractedContent,
        articleAnalysis: analyzeContent.data,
      });
      setReadState("explaining");
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
      {explainData.length > 0 && explainData[0] ? (
        <ScrollArea className="flex-1 h-full">
          <Explanation
            articleExplanation={
              explainData[0] as ArticleExplanation["paragraphs"]
            }
          />
        </ScrollArea>
      ) : (
        <div className="flex-1 flex h-full w-full justify-center items-center p-4">
          <Button onClick={handleReadForMe}>Read For Me</Button>
        </div>
      )}
    </>
  );
}
