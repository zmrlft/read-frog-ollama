import { useQuery } from "@tanstack/react-query";
import { Readability } from "@mozilla/readability";
import { franc } from "franc-min";
import { flattenToParagraphs } from "@/entrypoints/content/utils/article";
import { ExtractedContent } from "@/types/content";
import { LangCodeISO6393 } from "@/types/languages";

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

      // TODO: in analyzing, we should re-extract the article in case it changed, and reset the lang
      const lang = article?.textContent ? franc(article.textContent) : "und";

      await storage.setItem<LangCodeISO6393>(
        "local:readBuddy_detectedLangCode",
        lang === "und" ? "eng" : (lang as LangCodeISO6393)
      );

      return {
        article: {
          ...article,
          lang,
        },
        paragraphs,
      };
    },
    // staleTime: Infinity, // Only run once per page load
  });
}
