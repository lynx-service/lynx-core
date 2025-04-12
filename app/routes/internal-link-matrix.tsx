import type { Route } from "../+types/root";
import { useLoaderData } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "~/hooks/use-toast";
import { getSession } from "~/utils/session.server"; // sessionユーティリティをインポート
import { requireAuth } from "~/utils/auth.server"; // 認証ユーティリティをインポート
import type { ArticleItem } from "~/types/article";
import InternalLinkMatrix from '~/components/matrix/InternalLinkMatrix'; // 作成したコンポーネントをインポート
import ArticleDetailSidebar from '~/components/matrix/ArticleDetailSidebar'; // 作成したコンポーネントをインポート
import MatrixSearchFilter from '~/components/matrix/MatrixSearchFilter'; // 新しいコンポーネントをインポート
import MatrixStats from '~/components/matrix/MatrixStats'; // 新しいコンポーネントをインポート
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

// meta関数
export function meta({ }: Route.MetaArgs) {
  return [
    { title: "内部リンク マトリクス | LYNX" },
    { name: "description", content: "記事間の内部リンク構造をマトリクス表示します" },
  ];
}

// loader関数
export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const user = session.get("user");

  try {
    // content.tsxと同じAPIエンドポイントを使用
    const response = await fetch("http://localhost:3000/scraping/project/1", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const articles = await response.json();
    return { articles, user, error: null }; // エラーがない場合はnullを返す
  } catch (error) {
    console.error("API fetch error:", error);
    // エラー発生時は空の配列とエラーメッセージを返す
    return { articles: [], user, error: error instanceof Error ? error.message : "データの取得に失敗しました" };
  }
};

// デフォルトエクスポート
export default function InternalLinkMatrixRoute() {
  const { articles, error } = useLoaderData<typeof loader>(); // userはここでは使わないので省略
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast(); // エラー表示用
  const [searchTerm, setSearchTerm] = useState(""); // 検索語
  const [filterType, setFilterType] = useState<"all" | "hasLinks" | "noLinks" | "isolated" | "needsIncoming" | "needsOutgoing">("all"); // 拡張されたフィルタータイプ

  // エラーハンドリング
  useEffect(() => {
    if (error) {
      toast({
        title: "エラー",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // 検索とフィルタリング
  const filteredArticles = useMemo(() => {
    return articles.filter((article: ArticleItem) => {
      // 検索フィルター
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === "" || 
        article.metaTitle?.toLowerCase().includes(searchLower) ||
        article.metaDescription?.toLowerCase().includes(searchLower) ||
        article.articleUrl?.toLowerCase().includes(searchLower);
      
      // リンク状態の判定
      const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
      const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;
      
      // フィルタータイプに応じた絞り込み
      switch (filterType) {
        case "hasLinks":
          return matchesSearch && (hasOutgoingLinks || hasIncomingLinks);
        case "noLinks":
          return matchesSearch && !hasOutgoingLinks && !hasIncomingLinks;
        case "isolated":
          return matchesSearch && !hasOutgoingLinks && !hasIncomingLinks;
        case "needsIncoming":
          return matchesSearch && hasOutgoingLinks && !hasIncomingLinks;
        case "needsOutgoing":
          return matchesSearch && !hasOutgoingLinks && hasIncomingLinks;
        default:
          return matchesSearch;
      }
    });
  }, [articles, searchTerm, filterType]);

  // クリックされたセルに対応する「発リンク先記事」の情報をセットする
  const handleCellClick = (targetArticle: ArticleItem) => {
    setSelectedArticle(targetArticle);
    setIsSidebarOpen(true);
  };

  // サイドバーを閉じる処理
  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
    setSelectedArticle(null);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] overflow-x-hidden">
      {/* ページヘッダー（固定表示されない） */}
      <div className="container py-6">
        <h1 className="text-2xl font-bold">内部リンク マトリクス</h1>
        <p className="text-muted-foreground">
          記事間の内部リンクの有無をマトリクス形式で表示します。行がリンク元、列がリンク先です。
        </p>
      </div>

      {/* 統計情報表示 */}
      {articles && articles.length > 0 && (
        <div className="container">
          <MatrixStats articles={articles} />
        </div>
      )}

      {/* エラーメッセージ表示 */}
      {error && (
        <div className="container mb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* 検索・フィルター部分（固定表示） */}
      <MatrixSearchFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterType={filterType}
        setFilterType={setFilterType}
        articles={articles}
        filteredArticles={filteredArticles}
      />

      {/* マトリクス表示エリア（スクロール可能） */}
      <div className="flex-grow container py-4">
        <div className={`border rounded-lg overflow-hidden max-w-full ${isSidebarOpen ? 'lg:pr-[540px]' : ''}`}>
          {filteredArticles && filteredArticles.length > 0 ? (
            <InternalLinkMatrix
              articles={filteredArticles}
              onCellClick={handleCellClick}
            />
          ) : (
            !error && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">表示する記事データがありません。</p>
                {searchTerm || filterType !== "all" ? (
                  <p className="text-sm mt-2">検索条件を変更してみてください。</p>
                ) : null}
              </div>
            )
          )}
        </div>
      </div>

      {/* 詳細表示サイドバー */}
      <ArticleDetailSidebar
        article={selectedArticle}
        isOpen={isSidebarOpen}
        onClose={handleSidebarClose}
      />
    </div>
  );
}
