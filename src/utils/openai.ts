import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: import.meta.env.WXT_OPENAI_API_KEY,
  // TODO: remove this
  dangerouslyAllowBrowser: true,
});
