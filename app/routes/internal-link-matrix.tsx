import type { Route } from "../+types/root";
import { useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { useToast } from "~/hooks/use-toast";
import { getSession } from "~/utils/session.server"; // sessionユーティリティをインポート
import { requireAuth } from "~/utils/auth.server"; // 認証ユーティリティをインポート
import type { ArticleItem, InternalLinkItem } from "~/types/article";
import InternalLinkMatrix from '~/components/matrix/InternalLinkMatrix'; // 作成したコンポーネントをインポート
import ArticleDetailSidebar from '~/components/matrix/ArticleDetailSidebar'; // 作成したコンポーネントをインポート

// meta関数 (Route.を削除)
export function meta({ }: Route.MetaArgs) { // Route. を削除
  return [
    { title: "内部リンク マトリクス" },
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

// デフォルトエクスポート (content.tsxを参考に)
export default function InternalLinkMatrixRoute() {
  const { articles, error } = useLoaderData<typeof loader>(); // userはここでは使わないので省略
  const [selectedArticle, setSelectedArticle] = useState<ArticleItem | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { toast } = useToast(); // エラー表示用
  const [searchTerm, setSearchTerm] = useState(""); // 検索語
  const [filterType, setFilterType] = useState<"all" | "hasLinks" | "noLinks">("all"); // フィルタータイプ

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
  const filteredArticles = articles.filter((article: ArticleItem) => {
    // 検索フィルター
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === "" || 
      article.metaTitle?.toLowerCase().includes(searchLower) ||
      article.metaDescription?.toLowerCase().includes(searchLower) ||
      article.articleUrl?.toLowerCase().includes(searchLower);
    
    // リンク有無フィルター
    const hasInternalLinks = (article.internalLinks?.length || 0) > 0;
    const hasLinkedFrom = (article.linkedFrom?.length || 0) > 0;
    
    if (filterType === "hasLinks") {
      return matchesSearch && (hasInternalLinks || hasLinkedFrom);
    } else if (filterType === "noLinks") {
      return matchesSearch && !hasInternalLinks && !hasLinkedFrom;
    }
    
    return matchesSearch;
  });

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
    <div className="space-y-4">
      {/* ヘッダー部分 */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold">内部リンク マトリクス</h1>
          <p className="text-muted-foreground">
            記事間の内部リンクの有無をマトリクス形式で表示します。行がリンク元、列がリンク先です。
          </p>
        </div>

        {/* 検索・フィルター部分 */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          {/* 検索ボックス */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="タイトル、URL、説明で検索..."
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                onClick={() => setSearchTerm("")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          {/* フィルターボタン */}
          <div className="flex gap-2">
            <button
              className={`px-3 py-2 rounded-md text-sm ${filterType === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              onClick={() => setFilterType("all")}
            >
              すべて
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm ${filterType === "hasLinks" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              onClick={() => setFilterType("hasLinks")}
            >
              リンクあり
            </button>
            <button
              className={`px-3 py-2 rounded-md text-sm ${filterType === "noLinks" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
              onClick={() => setFilterType("noLinks")}
            >
              リンクなし
            </button>
          </div>
        </div>
      </div>

      {/* 検索結果カウント表示 */}
      {(searchTerm || filterType !== "all") && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          検索結果: {filteredArticles.length} 件
        </div>
      )}

      {/* エラーメッセージ表示 */}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">エラー:</span> {error}
        </div>
      )}

      {/* マトリクスとサイドバーを横並びに配置 */}
      <div className="flex flex-col lg:flex-row gap-4 relative">
        {/* マトリクス表示エリア */}
        <div className={`border rounded-lg overflow-x-auto flex-grow ${isSidebarOpen ? 'lg:pr-[540px]' : ''}`}>
          {/* filteredArticlesが存在し、エラーがない場合にマトリクスを表示 */}
          {filteredArticles && filteredArticles.length > 0 ? (
            <InternalLinkMatrix
              articles={filteredArticles}
              onCellClick={handleCellClick} // ハンドラを渡す
            />
          ) : (
            !error && <p className="p-4 text-center text-gray-500">表示する記事データがありません。</p> // エラーがない場合のみ表示
          )}
        </div>

        {/* 詳細表示サイドバー */}
        <ArticleDetailSidebar
          article={selectedArticle}
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
        />
      </div>
    </div>
  );
}
