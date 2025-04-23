import { useQuery } from "@tanstack/react-query";
import { Readability } from "@mozilla/readability";
import { franc } from "franc-min";
import { flattenToParagraphs } from "@/entrypoints/content/utils/article";
import { ExtractedContent } from "@/types/content";

export function useExtractContent() {
  return useQuery<ExtractedContent>({
    queryKey: ["extractContent"],
    queryFn: async () => {
      const documentClone = document.cloneNode(true);
      const article = new Readability(documentClone as Document, {
        serializer: (el) => el,
      }).parse();
      const paragraphs = article?.content
        ? flattenToParagraphs(article.content)
        : [];

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
}
