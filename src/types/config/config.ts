import { z } from "zod";

import { langCodeISO6393, langLevel } from "@/types/config/languages";
import { HOTKEYS } from "@/utils/constants/config";
import { MIN_SIDE_CONTENT_WIDTH } from "@/utils/constants/side";

import { providerSchema, providersConfigSchema } from "./provider";

const hotkey = z.enum(HOTKEYS);
export type Hotkey = (typeof HOTKEYS)[number];

// Language schema
const languageSchema = z.object({
  detectedCode: langCodeISO6393,
  sourceCode: langCodeISO6393.or(z.literal("auto")),
  targetCode: langCodeISO6393,
  level: langLevel,
});

// Manual translate schema
const manualTranslateSchema = z.object({
  enabled: z.boolean(),
  hotkey: hotkey,
});

// Floating button schema
const floatingButtonSchema = z.object({
  enabled: z.boolean(),
  position: z.number().min(0).max(1),
});

// side content schema
const sideContentSchema = z.object({
  width: z.number().min(MIN_SIDE_CONTENT_WIDTH),
});

// page translate schema
// TODO: add "article" as a range
export const pageTranslateRangeSchema = z.enum(["mainContent", "all"]);
export type PageTranslateRange = z.infer<typeof pageTranslateRangeSchema>;

const pageTranslateSchema = z.object({
  range: pageTranslateRangeSchema,
});

// Complete config schema
export const configSchema = z.object({
  language: languageSchema,
  provider: providerSchema,
  providersConfig: providersConfigSchema,
  manualTranslate: manualTranslateSchema,
  pageTranslate: pageTranslateSchema,
  floatingButton: floatingButtonSchema,
  sideContent: sideContentSchema,
});

export type Config = z.infer<typeof configSchema>;
