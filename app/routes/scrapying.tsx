import type { Route } from "./+types/home";
import { useLoaderData, useNavigate, useBlocker } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { Card, CardContent } from "~/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { scrapyRequestSchema, type ScrapyRequest } from "~/share/zod/schemas";
import { useScraping } from "~/hooks/use-scraping";
import type { UseScrapingReturn } from "~/types/scraping";
import { NavigationBlocker } from "~/components/scraping/NavigationBlocker";
import { PageHeader } from "~/components/scraping/PageHeader";
import { ScrapingStatus } from "~/components/scraping/ScrapingStatus";
import { ScrapingForm } from "~/components/scraping/ScrapingForm";
import { ScrapingResultsList } from "~/components/scraping/ScrapingResultsList";
import { useEffect } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "サイト分析実行 - LYNX" },
    { name: "description", content: "URLとクラス名を入力してサイト分析を実行します。" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) {
    throw new Response("認証トークンが見つかりません", { status: 401 });
  }

  // 認証トークンをクライアントに渡す
  return { token };
};

/**
 * スクレイピング実行ページ
 * コンポーネントに分割してリファクタリング済み
 */
export default function Scrapying() {
  // useLoaderData から token を取得
  const { token } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // カスタムフックを使用してスクレイピング機能を取得
  const {
    crawlStatus,
    progressInfo,
    errorMessage,
    scrapedArticles,
    jobId,
    startScraping,
    cancelScraping
  }: UseScrapingReturn = useScraping(token);

  // ナビゲーションブロッカーを設定
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      crawlStatus === 'running' && currentLocation.pathname !== nextLocation.pathname
  );

  // フォームを設定
  const form = useForm({
    resolver: zodResolver(scrapyRequestSchema),
    defaultValues: {
      startUrl: "",
      targetClass: "",
    },
  });

  // 結果の有無を確認
  const hasResults = scrapedArticles.length > 0;

  console.log("scrapedArticles", scrapedArticles);
  console.log("crawlStatus", crawlStatus);
  
  // スクレイピング完了時に結果画面に自動遷移
  // useEffect(() => {
  //   if (crawlStatus === 'completed' && hasResults) {
  //     navigate('/scraping-results');
  //   }
  // }, [crawlStatus, hasResults, navigate]);

  return (
    <div className="bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* ナビゲーションブロッカー */}
      {/* <NavigationBlocker 
        blocker={blocker} 
        onConfirm={async () => {
          if (cancelScraping) {
            await cancelScraping(true);
          }
          blocker.proceed();
        }} 
      /> */}
      
      <div className="max-w-3xl mx-auto">
        {/* ページヘッダー */}
        <PageHeader 
          hasResults={hasResults} 
          crawlStatus={crawlStatus} 
          onViewResults={() => navigate("/scraping/result")} 
        />
        
        <Card className="shadow-xl transition-all duration-300 hover:shadow-2xl">
          <CardContent className="p-6 sm:p-8">
            {/* スクレイピング状態表示 */}
            <ScrapingStatus 
              crawlStatus={crawlStatus} 
              progressInfo={progressInfo} 
              errorMessage={errorMessage} 
            />
            
            {/* スクレイピングフォーム */}
            <ScrapingForm 
              form={form} 
              onSubmit={startScraping} 
              crawlStatus={crawlStatus} 
              onCancel={() => cancelScraping(false)} 
            />
          </CardContent>
        </Card>
        
        {/* スクレイピング結果リスト */}
        <ScrapingResultsList articles={scrapedArticles} />
      </div>
    </div>
  );
}
