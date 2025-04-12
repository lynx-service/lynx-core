import { z } from "zod";

export const scrapyRequestSchema = z.object({
  startUrl: z.string()
    .min(1, "URLを入力してください")
    .url("有効なURLを入力してください（例: https://example.com）"),
  targetClass: z.string()
    .min(1, "クラス名を入力してください")
    .max(100, "クラス名は100文字以内で入力してください"),
});

export type ScrapyRequest = z.infer<typeof scrapyRequestSchema>;