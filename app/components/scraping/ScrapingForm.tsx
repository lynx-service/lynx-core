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
 * モダンなデザインに改善
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
          className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
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
                <FormLabel className="text-base font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                  </svg>
                  スクレイピングURL <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">https://</span>
                    </div>
                    <Input
                      placeholder="example.com/blog"
                      className="h-12 pl-16 pr-4 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>スクレイピングを開始するURLを入力してください（必須）</span>
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
                <FormLabel className="text-base font-medium text-gray-700 dark:text-gray-200 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-emerald-500 dark:text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.243 5.757a6 6 0 10-.986 9.284 1 1 0 111.087 1.678A8 8 0 1118 10a3 3 0 01-4.8 2.401A4 4 0 1114 10a1 1 0 102 0c0-1.537-.586-3.07-1.757-4.243zM12 10a2 2 0 10-4 0 2 2 0 004 0z" clipRule="evenodd" />
                  </svg>
                  対象クラス名 <span className="text-red-500 ml-1">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">class="</span>
                    </div>
                    <Input
                      placeholder="content-class"
                      className="h-12 pl-16 pr-4 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200 shadow-sm hover:shadow-md"
                      {...field}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">"</span>
                    </div>
                  </div>
                </FormControl>
                <FormDescription className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>スクレイピング対象のHTML要素のクラス名を入力してください（必須）</span>
                </FormDescription>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
        </div>

        <div className="pt-6">
          <Button
            type="submit"
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            サイト分析を開始する
          </Button>
        </div>
      </form>
    </Form>
  );
}
