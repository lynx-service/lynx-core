import type { Route } from "./+types/home";
import { useLoaderData, useActionData, Form as RouterForm, useSubmit, useNavigate, useBlocker } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { scrapyRequestSchema, type ScrapyRequest } from "~/share/zod/schemas";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { articlesAtom } from "~/atoms/article";
import type { ArticleItem } from "~/types/article";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);
};

export const action = async ({ request }: Route.ActionArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  // フォームデータを取得
  const formData = await request.formData();
  const startUrl = formData.get("startUrl") as string;
  const targetClass = formData.get("targetClass") as string;

  // バリデーション
  const result = scrapyRequestSchema.safeParse({ startUrl, targetClass });
  if (!result.success) {
    return {
      ok: false,
      error: "入力データが不正です",
      validationErrors: result.error.format()
    };
  }

  try {
    // FastAPIエンドポイントを呼び出す
    const response = await fetch("http://localhost:8000/crawl/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        start_url: result.data.startUrl,
        target_class: result.data.targetClass
      }),
    });

    console.log(response);

    if (!response.ok) {
      return {
        ok: false,
        error: `API error: ${response.status}`
      };
    }

    const data = await response.json();

    console.log(data);
    return {
      ok: true,
      data
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "スクレイピング中にエラーが発生しました"
    };
  }
};

export default function Scrapying() {
  const actionData = useActionData();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setScrapingResults] = useAtom(articlesAtom);

  // ナビゲーションブロッカーを設定
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isSubmitting && currentLocation.pathname !== nextLocation.pathname
  );

  // フォームを設定
  const form = useForm<ScrapyRequest>({
    resolver: zodResolver(scrapyRequestSchema),
    defaultValues: {
      startUrl: "",
      targetClass: "",
    },
  });

  // フォーム送信時の処理
  const onSubmit = (values: ScrapyRequest) => {
    setIsSubmitting(true);

    // FormDataを手動で作成
    const formData = new FormData();
    formData.append("startUrl", values.startUrl);
    formData.append("targetClass", values.targetClass);

    // React Router v7のsubmit関数を使用してフォームを送信
    submit(formData, { method: "post" });
  };

  // actionの結果が返ってきたらisSubmittingをfalseに戻す
  useEffect(() => {
    if (actionData) {
      setIsSubmitting(false);

      // スクレイピングが成功した場合
      if (actionData.ok && actionData.data) {
        // スクレイピング結果をJotaiのatomに保存
        const scrapedData = actionData.data.scraped_data || [];

        setScrapingResults(scrapedData);

        // 結果表示画面に遷移
        // NOTE：ナビゲーションブロッカーを設定していると動作しないので一旦コメントアウト
        // if (scrapedData.length > 0) {
        //   navigate("/scraping/result");
        // }
      }
    }
  }, [actionData, navigate, setScrapingResults]);

  // スクレイピング結果の有無を確認
  const [results] = useAtom(articlesAtom);
  const hasResults = results.length > 0;

  console.log(results);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      {/* ナビゲーションブロッカー */}
      {blocker.state === "blocked" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              処理の中断確認
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-5">
              スクレイピング処理が進行中です。このページを離れると処理が中断されます。本当に移動しますか？
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => blocker.reset()}
              >
                キャンセル
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setIsSubmitting(false);
                  blocker.proceed();
                }}
              >
                移動する
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
              サイト分析ツール
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl">
            URLとクラス名を入力して、ウェブサイトの構造を分析します
          </p>

          {hasResults && (
            <div className="mt-5">
              <Button
                onClick={() => navigate("/scraping/result")}
                // className="bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                スクレイピング結果を表示する
              </Button>
            </div>
          )}
        </div>

        <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            {isSubmitting && (
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg">
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 text-amber-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-amber-700 dark:text-amber-300 font-medium">
                    スクレイピング処理中です。このページを離れると処理が中断されます。
                  </p>
                </div>
              </div>
            )}

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
                            // required
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
                            // required
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
                    disabled={isSubmitting}
                    className={`w-full ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        処理中...
                      </div>
                    ) : "サイト分析を開始する"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* エラーメッセージカード */}
        {actionData?.error && (
          <Card className="mt-6 border-red-200 dark:border-red-800 animate-fade-in">
            <CardContent className="p-4 flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">エラーが発生しました</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {actionData.error}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
