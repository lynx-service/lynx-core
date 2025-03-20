import type { Route } from "./+types/home";
import { useLoaderData, useActionData, Form as RouterForm, useSubmit, useNavigate } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { scrapyRequestSchema, type ScrapyRequest } from "~/share/zod/schemas";
import { useState, useEffect } from "react";
import { useAtom } from "jotai";
import { scrapingResultsAtom, type EditableScrapingResultItem, type HeadingItem, type InternalLinkItem } from "~/atoms/scrapingResults";
import { v4 as uuidv4 } from "uuid";

// shadcn/uiコンポーネント
import { Button } from "~/components/ui/button";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Skeleton } from "~/components/ui/skeleton";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "~/components/ui/tooltip";
import { ClientOnly } from "~/components/ui/client-only";
import { AlertTriangle, Info, Search, FileText } from "lucide-react";

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
  const user = session.get("user");

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
        // "Authorization": `Bearer ${token}`,
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
            internal_links: item.internal_links?.map((link: string) => ({ url: link } as InternalLinkItem)) || [],
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
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
              サイト分析ツール
            </span>
          </h1>
          <p className="text-muted-foreground">
            URLとクラス名を入力して、ウェブサイトの構造を分析します
          </p>
        </div>

        {/* エラー表示 */}
        {actionData?.error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>
              {actionData.error}
            </AlertDescription>
          </Alert>
        )}

        {/* 既存結果へのリンク */}
        {hasResults && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">既存の分析結果</CardTitle>
              <CardDescription>前回のスクレイピング結果を確認できます</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate("/scraping-results")}
                variant="outline"
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                スクレイピング結果を表示
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 入力フォーム */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>スクレイピング設定</CardTitle>
            <CardDescription>分析対象のURLとクラス名を入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="startUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>スクレイピングURL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="https://example.com"
                              {...field}
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    className="absolute right-0 top-0"
                                  >
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>スクレイピングを開始するURLを入力してください</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </FormControl>
                        <FormDescription>
                          スクレイピングを開始するURLを入力してください
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetClass"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>対象クラス名</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="content-class"
                              {...field}
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon"
                                    className="absolute right-0 top-0"
                                  >
                                    <Info className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>スクレイピング対象のHTML要素のクラス名を入力してください</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </FormControl>
                        <FormDescription>
                          スクレイピング対象のHTML要素のクラス名を入力してください
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      処理中...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      サイト分析を開始する
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
