import { z } from "zod";

export const scrapyRequestSchema = z.object({
  // クロールするURL(文字列の配列)
  startUrl: z.string({
    message: "startUrl は文字列で指定してください。",
  }),
  // クロール対象のクラス名
  targetClass: z.string({
    message: "targetClass は文字列で指定してください。",
  }),
});

export type ScrapyRequest = z.infer<typeof scrapyRequestSchema>;
