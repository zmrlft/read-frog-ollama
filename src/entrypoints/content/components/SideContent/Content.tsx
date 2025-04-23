import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";
import { toast } from "sonner";
import Explanation from "./Explanation";
import { useExtractContent } from "@/hooks/read/extract";
import { useAnalyzeContent } from "@/hooks/read/analyze";
import { useAtom } from "jotai";
import { explainAtom, requestContinueAtom } from "../../atoms";

export default function Content() {
  const [requestContinue, setRequestContinue] = useAtom(requestContinueAtom);
  const { data: extractedContent } = useExtractContent();
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

  return (
    <>
      {articleExplanation ? (
        <ScrollArea className="flex-1 h-full p-2">
          <Explanation articleExplanation={articleExplanation} />
        </ScrollArea>
      ) : (
        <div className="flex-1 flex h-full w-full justify-center items-center">
          {(() => {
            if (isGeneratingAnalysis || isGeneratingExplanation) {
              return (
                <div>
                  {isGeneratingAnalysis ? "Analyzing..." : "Generating..."}
                </div>
              );
            }
            if (requestContinue) {
              return (
                <div>
                  Are you sure to continue?
                  <Button onClick={handleContinue}>Continue</Button>
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
