import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { toast } from "sonner";
import Explanation from "./Explanation";
import { useExtractContent } from "@/hooks/read/extract";
import { useAnalyzeContent } from "@/hooks/read/analyze";
import { useAtom, useAtomValue } from "jotai";
import { explainAtom, progressAtom, requestContinueAtom } from "../../atoms";
import { testExplanation } from "../../test";
import LoadingDots from "@/components/LoadingDots";
import { Progress } from "@/components/ui/Progress";

export default function Content() {
  const [requestContinue, setRequestContinue] = useAtom(requestContinueAtom);
  const progress = useAtomValue(progressAtom);
  const { isPending: isExtractingContent, data: extractedContent } =
    useExtractContent();
  const {
    mutate: analyzeContent,
    isPending: isGeneratingAnalysis,
    data: articleAnalysis,
  } = useAnalyzeContent();
  const [
    {
      mutate: explainArticle,
      isPending: isGeneratingExplanation,
      data: articleExplanation,
    },
  ] = useAtom(explainAtom);

  const handleReadForMe = () => {
    console.log("start to read for me");
    if (!extractedContent?.paragraphs.join("\n").trim()) {
      toast.error("Cannot read the content: content is not available");
      return;
    }
    analyzeContent(extractedContent);
  };

  const handleContinue = () => {
    setRequestContinue(false);
    if (articleAnalysis && extractedContent) {
      explainArticle({
        extractedContent,
        articleAnalysis,
      });
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

  return (
    <>
      {articleExplanation ? (
        <ScrollArea className="flex-1 h-full">
          <Explanation
            articleExplanation={articleExplanation ?? testExplanation}
          />
        </ScrollArea>
      ) : (
        <div className="flex-1 flex h-full w-full justify-center items-center p-4">
          {(() => {
            if (isGeneratingAnalysis || isGeneratingExplanation) {
              return (
                <>
                  {isGeneratingAnalysis ? (
                    <div className="flex items-center gap-2">
                      <LoadingDots />
                      Analyzing...
                    </div>
                  ) : (
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
                  )}
                </>
              );
            }
            if (requestContinue) {
              return (
                <div className="flex flex-col gap-6">
                  <p>
                    The content does not appear to be an article or book. Are
                    you sure you want to proceed?
                  </p>
                  <Button className="mx-auto" onClick={handleContinue}>
                    Continue
                  </Button>
                </div>
              );
            }
            return (
              <Button onClick={handleReadForMe} disabled={isGeneratingAnalysis}>
                Read For Me
              </Button>
            );
          })()}
        </div>
      )}
    </>
  );
}
