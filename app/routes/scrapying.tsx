import type { Route } from "./+types/home";
import { useLoaderData, Form as RouterForm, useNavigate, useBlocker } from "react-router";
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
import { useState, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { articlesAtom } from "~/atoms/article";
// ScrapedArticle 型をインポート (app/types/article.ts に移動推奨)
import type { ArticleItem } from "~/types/article";

// ProgressInfo, CrawlStatus 型を定義
type CrawlStatus = 'idle' | 'running' | 'completed' | 'error';
interface ProgressInfo {
  processedPages: number;
  elapsedTime: number;
  message: string;
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "サイト分析実行 - LYNX" }, // タイトルを修正
    { name: "description", content: "URLとクラス名を入力してサイト分析を実行します。" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request); // userId を受け取るように変更 (必要であれば)
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    // トークンがない場合はエラーまたはログインへリダイレクト
    // throw redirect("/login"); // 例
    throw new Response("認証トークンが見つかりません", { status: 401 });
  }

  // 認証トークンをクライアントに渡す
  return { token };
};

// action 関数は削除

export default function Scrapying() {
  // useLoaderData から token を取得
  const { token } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // スクレイピングの状態管理
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus>('idle');
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);
  const [scrapedArticles, setScrapedArticles] = useState<ArticleItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [, setGlobalScrapingResults] = useAtom(articlesAtom); // Jotai atom の setter

  // ナビゲーションブロッカーを設定 (crawlStatus に基づく)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      crawlStatus === 'running' && currentLocation.pathname !== nextLocation.pathname
  );

  // フォームを設定
  const form = useForm<ScrapyRequest>({
    resolver: zodResolver(scrapyRequestSchema),
    defaultValues: {
      startUrl: "",
      targetClass: "",
    },
  });

  // ストリーム処理関数
  const processStream = useCallback(async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = "";
    let currentArticles: ArticleItem[] = []; // ローカルで記事を蓄積

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // ストリーム終了時に残っているバッファを処理
          if (buffer.trim()) {
            try {
              const json = JSON.parse(buffer.trim());
              // 最後のデータ処理
              if (json.type === 'completion') {
                setProgressInfo(prev => ({ ...prev, message: json.message, processedPages: json.processed_pages, elapsedTime: json.total_time }));
                setCrawlStatus('completed');
                setGlobalScrapingResults(currentArticles); // 完了時にJotaiを更新
              } else if (!json.type && typeof json === 'object' && json !== null && 'articleUrl' in json) { // 記事データか確認
                currentArticles = [...currentArticles, json];
                setScrapedArticles(currentArticles); // UI用にローカルstateも更新
              } else if (json.error) { // FastAPIからのエラー
                 setErrorMessage(`スクレイピングエラー: ${json.error}`);
                 setCrawlStatus('error');
              }
            } catch (e) {
              console.error("Error parsing final JSON chunk:", e, buffer);
              setErrorMessage(`レスポンスの最終チャンク解析エラー: ${buffer}`);
              setCrawlStatus('error');
            }
          } else if (crawlStatus !== 'completed' && crawlStatus !== 'error') {
             // バッファが空で終了したが、完了/エラー状態でない場合
             console.warn("Stream ended unexpectedly without completion/error message.");
             // 状況に応じてエラーとするか判断
             // setCrawlStatus('error');
             // setErrorMessage("スクレイピングが完了メッセージなしで終了しました。");
             // または、現状の結果で完了とする場合
             setCrawlStatus('completed');
             setGlobalScrapingResults(currentArticles);
          }
          break; // ループ終了
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // 最後の不完全な行をバッファに残す

        for (const line of lines) {
          if (!line.trim()) continue; // 空行はスキップ
          try {
            const json = JSON.parse(line.trim());

            // データタイプに応じてstateを更新
            if (json.type === 'status') {
              setProgressInfo({ message: json.message, processedPages: 0, elapsedTime: 0 });
            } else if (json.type === 'progress') {
              setProgressInfo({ message: json.message, processedPages: json.processed_pages, elapsedTime: json.elapsed_time });
            } else if (json.type === 'completion') {
              setProgressInfo(prev => ({ ...prev, message: json.message, processedPages: json.processed_pages, elapsedTime: json.total_time }));
              setCrawlStatus('completed');
              setGlobalScrapingResults(currentArticles); // 完了時にJotaiを更新
              break; // 完了したらループを抜ける
            } else if (json.error) { // FastAPIからのエラー
              setErrorMessage(`スクレイピングエラー: ${json.error}`);
              setCrawlStatus('error');
              break; // エラー発生時もループを抜ける
            } else if (!json.type && typeof json === 'object' && json !== null && 'articleUrl' in json) { // 記事データか確認
              currentArticles = [...currentArticles, json];
              setScrapedArticles(currentArticles); // UI用にローカルstateも更新
            } else {
              console.warn("Unknown JSON structure received:", json); // 想定外のデータ
            }
          } catch (e) {
            console.error("Error parsing JSON line:", e, line);
            setErrorMessage(`レスポンスの解析中にエラーが発生しました: ${line}`);
            setCrawlStatus('error');
            break; // 解析エラー時もループを抜ける
          }
        }
        // ループ内で完了またはエラーになったら外側のループも抜ける
        if (crawlStatus === 'completed' || crawlStatus === 'error') break;
      }
    } catch (error) {
      console.error("Error reading stream:", error);
      setErrorMessage(error instanceof Error ? error.message : "ストリームの読み取り中にエラーが発生しました");
      setCrawlStatus('error');
    } finally {
      reader.releaseLock(); // リーダーを解放
      // ループが正常に完了せず、かつエラー状態でもない場合（ネットワーク断など）
      if (crawlStatus !== 'completed' && crawlStatus !== 'error') {
        setCrawlStatus('error');
        if (!errorMessage) {
          setErrorMessage("スクレイピング処理が予期せず終了しました。");
        }
      }
    }
  }, [setGlobalScrapingResults, crawlStatus, errorMessage]); // crawlStatusとerrorMessageを依存配列に追加

  // フォーム送信時の処理 (fetchとストリーム処理を開始)
  const onSubmit = useCallback(async (values: ScrapyRequest) => {
    // 状態をリセット
    setCrawlStatus('running');
    setProgressInfo(null);
    setScrapedArticles([]); // ローカルstateもリセット
    setErrorMessage(null);
    setGlobalScrapingResults([]); // Jotaiもリセット

    try {
      // APIエンドポイントをプロキシ経由の相対パスに変更
      const response = await fetch("/api/crawl/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`, // loaderから取得したトークンを使用
        },
        body: JSON.stringify({
          start_url: values.startUrl,
          target_class: values.targetClass
        }),
      });

      if (!response.ok) {
        // API自体がエラーを返した場合 (ストリーム開始前)
        const errorText = await response.text(); // エラー内容を取得試行
        let errorDetail = `APIエラー: ${response.status}`;
        try {
            const errorJson = JSON.parse(errorText);
            errorDetail = errorJson.detail || errorDetail;
        } catch {
            // JSONパース失敗時はテキストをそのまま使う
            if (errorText) errorDetail += ` - ${errorText}`;
        }
        throw new Error(errorDetail);
      }

      if (!response.body) {
        throw new Error("レスポンスボディがありません");
      }

      const reader = response.body.getReader();
      await processStream(reader); // ストリーム処理を開始

    } catch (err) {
      console.error("Scraping request failed:", err);
      setErrorMessage(err instanceof Error ? err.message : "スクレイピングリクエストの送信中にエラーが発生しました");
      setCrawlStatus('error');
    }
  }, [token, processStream, setGlobalScrapingResults]); // 依存配列に token と processStream を追加

  // スクレイピング結果の有無を確認 (ローカルstateを使用)
  const hasResults = scrapedArticles.length > 0;

  return (
    <div className="bg-background py-12 px-4 sm:px-6 lg:px-8">
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
                  // TODO: ストリームを中断する処理を追加する (AbortControllerなど)
                  setCrawlStatus('idle'); // 状態をリセット
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

          {/* 結果表示ボタン (完了時かつ結果がある場合のみ表示) */}
          {crawlStatus === 'completed' && hasResults && (
            <div className="mt-5">
              <Button
                onClick={() => navigate("/scraping-results")} // 結果表示ルートへ
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
            {/* 進行状況表示 */}
            {crawlStatus === 'running' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex items-center mb-2">
                  <svg className="animate-spin h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-blue-700 dark:text-blue-300 font-medium">
                    スクレイピング処理中です...
                  </p>
                </div>
                {progressInfo && (
                  <div className="text-sm text-blue-600 dark:text-blue-400 pl-8">
                    <p>{progressInfo.message}</p>
                    <p>処理済みページ数: {progressInfo.processedPages}</p>
                    <p>経過時間: {progressInfo.elapsedTime.toFixed(2)}秒</p>
                  </div>
                )}
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pl-8">
                    このページを離れると処理が中断されます。
                  </p>
              </div>
            )}

            {/* 完了メッセージ */}
             {crawlStatus === 'completed' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center">
                   <svg className="h-5 w-5 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                   </svg>
                  <p className="text-green-700 dark:text-green-300 font-medium">
                    スクレイピングが完了しました。
                  </p>
                </div>
                 {progressInfo && (
                  <div className="text-sm text-green-600 dark:text-green-400 pl-8 mt-1">
                    <p>総処理ページ数: {progressInfo.processedPages}</p>
                    <p>総処理時間: {progressInfo.elapsedTime.toFixed(2)}秒</p>
                  </div>
                )}
              </div>
            )}

            {/* エラーメッセージ */}
            {crawlStatus === 'error' && errorMessage && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
                <div className="flex items-center">
                   <svg className="h-5 w-5 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                   </svg>
                  <p className="text-red-700 dark:text-red-300 font-medium">
                    エラーが発生しました:
                  </p>
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1 pl-8">{errorMessage}</p>
              </div>
            )}


            {/* スクレイピングフォーム */}
            <Form {...form}>
              {/* onSubmit を form の onSubmit に直接渡す */}
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
                            disabled={crawlStatus === 'running'} // 実行中は無効化
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
                            disabled={crawlStatus === 'running'} // 実行中は無効化
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
                    disabled={crawlStatus === 'running'} // 実行中は無効化
                    className={`w-full ${crawlStatus === 'running' ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {crawlStatus === 'running' ? (
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

        {/* リアルタイム結果表示エリア (簡易版) */}
        {scrapedArticles.length > 0 && (
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">受信した記事データ ({scrapedArticles.length}件)</h3>
              <ul className="space-y-2 max-h-96 overflow-y-auto text-sm">
                {scrapedArticles.map((article, index) => (
                  <li key={index} className="border-b pb-1">
                    <a href={article.articleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {article.metaTitle || article.articleUrl}
                    </a>
                    <span className="text-xs text-gray-500 ml-2">({article.internalLinks.length}内部 / {article.outerLinks.length}外部リンク)</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 以前のエラーメッセージカード (削除) */}
        {/* {actionData?.error && ( ... )} */}
      </div>
    </div>
  );
}
