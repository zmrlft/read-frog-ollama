import { type ArticleExplanation } from "../../../../types/content";

export default function Explanation({
  articleExplanation: explanation,
}: {
  articleExplanation: ArticleExplanation["paragraphs"];
}) {
  // flatten the paragraphs
  const flattenedSentences = explanation.flat();
  return (
    <div>
      <div>
        {flattenedSentences.map((sentence, pIndex) => (
          <div key={pIndex} className="mb-6">
            <div className="text-base mb-2">{sentence.originalSentence}</div>
            <div className="text-base mb-2 text-muted-foreground">
              {sentence.translatedSentence}
            </div>
            {sentence.words.length > 0 && (
              <div className="bg-muted p-3 rounded-md mb-3">
                <h4 className="text-sm font-medium mb-2">重点词汇</h4>
                <ul className="space-y-2">
                  {sentence.words.map((word, wIndex) => (
                    <li key={wIndex} className="text-sm">
                      <span className="font-semibold">{word.word}</span> (
                      {word.partOfSpeech}): {word.explanation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-sm text-muted-foreground">
              {sentence.explanation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
