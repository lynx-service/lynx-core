import React from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Button } from '~/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import type { ScrapyRequest } from '~/share/zod/schemas';
import type { CrawlStatus } from '~/types/scraping';

interface ScrapingFormProps {
  form: UseFormReturn<ScrapyRequest>;
  onSubmit: (values: ScrapyRequest) => Promise<void>;
  crawlStatus: CrawlStatus;
  onCancel: () => Promise<void>;
}

/**
 * スクレイピングフォームコンポーネント
 * URL入力、クラス名入力、送信ボタン、中断ボタンを含む
 */
export function ScrapingForm({ form, onSubmit, crawlStatus, onCancel }: ScrapingFormProps) {
  // スクレイピング実行中は中断ボタンのみ表示
  if (crawlStatus === 'running') {
    return (
      <div className="pt-4">
        <Button
          type="button"
          variant="destructive"
          onClick={() => onCancel()}
          className="w-full"
        >
          スクレイピングを中断する
        </Button>
      </div>
    );
  }

  // 通常時はフォームを表示
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="startUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-gray-700 dark:text-gray-200">
                  スクレイピングURL <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    className="h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                  スクレイピングを開始するURLを入力してください（必須）
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="targetClass"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-gray-700 dark:text-gray-200">
                  対象クラス名 <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="content-class"
                    className="h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200"
                    {...field}
                  />
                </FormControl>
                <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                  スクレイピング対象のHTML要素のクラス名を入力してください（必須）
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-4">
          <Button
            type="submit"
            className="w-full"
          >
            サイト分析を開始する
          </Button>
        </div>
      </form>
    </Form>
  );
}
