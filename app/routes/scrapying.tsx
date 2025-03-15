import type { Route } from "./+types/home";
import { useLoaderData, useActionData, Form as RouterForm, useSubmit, useNavigate } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { Container, Typography, Alert } from "@mui/material";
import { Button } from "~/components/ui/button";
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
import { scrapingResultsAtom, type EditableScrapingResultItem, type HeadingItem } from "~/atoms/scrapingResults";
import { v4 as uuidv4 } from "uuid";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "サイト分析ツール" },
    { name: "description", content: "ウェブサイトの構造を分析します" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const refreshToken = session.get("refreshToken");
  const user = session.get("user");

  const res = await fetch("http://localhost:3000/hello", {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });

  if (!res.ok) {
    throw new Response("Failed to fetch data", { status: res.status });
  }

  const data: string = await res.text();
  return { data, user, token, refreshToken };
};

export const action = async ({ request }: Route.ActionArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const refreshToken = session.get("refreshToken");

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

    if (!response.ok) {
      return {
        ok: false,
        error: `API error: ${response.status}`
      };
    }

    const data = await response.json();

    return {
      ok: true,
      data,
      token,
      refreshToken
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "スクレイピング中にエラーが発生しました"
    };
  }
};

// 階層構造の見出しデータを処理する関数
const processHeadings = (headings: any[]): HeadingItem[] => {
  return headings.map(heading => ({
    tag: heading.tag || "",
    text: heading.text || "",
    children: heading.children ? processHeadings(heading.children) : []
  }));
};

export default function Scrapying() {
  const { data, user, token, refreshToken } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setScrapingResults] = useAtom(scrapingResultsAtom);

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

  // コンポーネントマウント時の処理
  useEffect(() => {
    // 必要に応じて初期化処理を行う
  }, []);

  // actionの結果が返ってきたらisSubmittingをfalseに戻す
  useEffect(() => {
    if (actionData) {
      setIsSubmitting(false);

      // スクレイピングが成功した場合
      if (actionData.ok && actionData.data) {
        // スクレイピング結果をJotaiのatomに保存
        const scrapedData = actionData.data.scraped_data || [];
        const editableResults: EditableScrapingResultItem[] = Array.isArray(scrapedData)
          ? scrapedData.map((item: any) => ({
            id: uuidv4(),
            url: item.current_url || "",
            title: item.title || "",
            content: item.description || "",
            index_status: item.index_status || "unknown",
            internal_links: item.internal_links || [],
            headings: processHeadings(item.headings || []),
            isEditing: false
          }))
          : []; // データが配列でない場合は空配列を設定

        // 結果をatomに保存
        setScrapingResults(editableResults);

        // 結果表示画面に遷移
        navigate("/scraping-results");
      }
    }
  }, [actionData, navigate, setScrapingResults]);

  // スクレイピング結果の有無を確認
  const [results] = useAtom(scrapingResultsAtom);
  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
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
                onClick={() => navigate("/scraping-results")}
                className="bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
                スクレイピング結果を表示
              </Button>
            </div>
          )}
        </div>

        {actionData?.error && (
          <div className="mt-6 mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-fade-in">
            <div className="flex">
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
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
          <div className="p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="startUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium text-gray-700 dark:text-gray-200">
                          スクレイピングURL
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com"
                            className="h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                          スクレイピングを開始するURLを入力してください
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
                          対象クラス名
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="content-class"
                            className="h-12 px-4 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 transition-all duration-200"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-sm text-gray-500 dark:text-gray-400">
                          スクレイピング対象のHTML要素のクラス名を入力してください
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
                    className={`w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-medium rounded-lg text-base transition-all duration-300 transform hover:scale-[1.02] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
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
          </div>
        </div>
      </div>
    </div>
  );
}
