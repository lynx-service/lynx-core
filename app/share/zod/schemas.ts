import { z } from "zod";

export const scrapyRequestSchema = z.object({
  // クロールするURL(文字列の配列)
  startUrl: z
    .string({
      message: "startUrl は文字列で指定してください。",
    })
    .min(1, { message: "startUrl は必須項目です。" }),
  // クロール対象のクラス名
  targetClass: z
    .string({
      message: "targetClass は文字列で指定してください。",
    })
    .min(1, { message: "targetClass は必須項目です。" }),
});

export type ScrapyRequest = z.infer<typeof scrapyRequestSchema>;
