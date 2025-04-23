import { z } from "zod";

export type ExtractedContent = {
  article: {
    title?: string | null | undefined;
    byline?: string | null | undefined;
    dir?: string | null | undefined;
    content?: Node | null | undefined;
    textContent?: string | null | undefined;
    length?: number | null | undefined;
    excerpt?: string | null | undefined;
    siteName?: string | null | undefined;
    lang: string | null | undefined;
  };
  paragraphs: string[];
};

export const articleAnalysisSchema = z.object({
  isArticle: z.boolean(),
  originalTitle: z.string(),
  translatedTitle: z.string(),
  summary: z.string(),
  introduction: z.string(),
  terms: z.array(z.string()),
});

export const articleExplanationSchema = z.object({
  paragraphs: z.array(
    z.array(
      z.object({
        originalSentence: z.string(),
        translatedSentence: z.string(),
        words: z.array(
          z.object({
            word: z.string(),
            partOfSpeech: z.string(),
            explanation: z.string(),
          })
        ),
        explanation: z.string(),
      })
    )
  ),
});

export type ArticleAnalysis = z.infer<typeof articleAnalysisSchema>;
export type ArticleExplanation = z.infer<typeof articleExplanationSchema>;
