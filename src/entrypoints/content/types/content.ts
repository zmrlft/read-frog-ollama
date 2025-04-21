import { z } from "zod";
import { camelCaseSchemaDef } from "@/utils/zod";

export const summarySchema = camelCaseSchemaDef(
  z.object({
    isArticle: z.boolean(),
    summary: z.string(),
    introduction: z.string(),
    terms: z.array(z.string()),
  })
);

export type Summary = z.infer<typeof summarySchema>;
