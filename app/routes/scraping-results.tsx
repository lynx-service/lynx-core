import type { Route } from "./+types/home";
import { useLoaderData, useNavigate } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { Button } from "~/components/ui/button";
import { useAtom } from "jotai";
import { scrapingResultsAtom, type EditableScrapingResultItem, type HeadingItem } from "~/atoms/scrapingResults";
import { useState, useCallback, useEffect } from "react";
import { ScrapingResultModal } from "~/components/scraping/ScrapingResultModal";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "スクレイピング結果" },
    { name: "description", content: "スクレイピング結果の編集" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const refreshToken = session.get("refreshToken");
  const user = session.get("user");

  try {
    // バックエンドAPIからスクレイピング結果を取得
    const response = await fetch("http://localhost:3000/scraping", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const scrapingResults = await response.json();
    
    return { user, token, refreshToken, scrapingResults, error: null };
  } catch (error) {
    console.error("Failed to fetch scraping results:", error);
    return { 
      user, 
      token,
      refreshToken,
      scrapingResults: null, 
      error: error instanceof Error ? error.message : "データの取得に失敗しました" 
    };
  }
};

export default function ScrapingResults() {
  const { user, token, refreshToken, scrapingResults, error } = useLoaderData<typeof loader>();
  const [results, setResults] = useAtom(scrapingResultsAtom);
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableScrapingResultItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(error);

  // スクレイピング結果をバックエンドに保存する関数
  const saveAllResultsToBackend = async () => {
    try {
      setIsLoading(true);
      
      // トークンの確認
      if (!token) {
        throw new Error("認証情報が見つかりません");
      }
      
      const response = await fetch("http://localhost:3000/scraping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          scrapyingResultItems: results.map(item => ({
            id: item.id,
            url: item.url,
            title: item.title,
            content: item.content,
            index_status: item.index_status,
            internal_links: item.internal_links,
            headings: item.headings
          }))
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      alert("スクレイピング結果を保存しました");
      return data;
    } catch (error) {
      console.error("Failed to save results:", error);
      setApiError(error instanceof Error ? error.message : "結果の保存に失敗しました");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // バックエンドから取得したデータをJotaiのatomに設定
  useEffect(() => {
    if (scrapingResults && Array.isArray(scrapingResults) && scrapingResults.length > 0) {
      // バックエンドから取得したデータをEditableScrapingResultItem形式に変換
      const editableResults: EditableScrapingResultItem[] = scrapingResults.map(item => {
        // 見出しの階層構造を処理
        const processHeadings = (headings: any[]): HeadingItem[] => {
          return headings.map(heading => ({
            tag: heading.tag || "",
            text: heading.text || "",
            children: heading.children ? processHeadings(heading.children) : []
          }));
        };

        return {
          id: item.id || "",
          url: item.articleUrl || "",
          title: item.metaTitle || "",
          content: item.metaDescription || "",
          index_status: item.isIndexable ? "index" : "noindex",
          internal_links: item.innerLinks?.map((link: { linkUrl: string }) => link.linkUrl) || [],
          headings: item.headings ? processHeadings(item.headings) : [],
          isEditing: false
        };
      });

      // バックエンドから取得したデータを設定
      setResults(editableResults);
    }
  }, [scrapingResults, setResults]);

  // 編集内容をバックエンドに保存する関数
  const saveToBackend = async (item: EditableScrapingResultItem) => {
    try {
      setIsLoading(true);
      
      // トークンの確認
      if (!token) {
        throw new Error("認証情報が見つかりません");
      }
      
      const response = await fetch(`http://localhost:3000/scraping/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          scrapyingResultItems: [{
            id: item.id,
            url: item.url,
            title: item.title,
            content: item.content,
            index_status: item.index_status,
            internal_links: item.internal_links,
            headings: item.headings
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Failed to save changes:", error);
      setApiError(error instanceof Error ? error.message : "変更の保存に失敗しました");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // 項目の削除
  const deleteItem = (id: string) => {
    setResults(prev => prev.filter(item => item.id !== id));
    setIsDialogOpen(false);
  };

  // 編集モードの開始
  const startEditing = () => {
    if (selectedItemId) {
      const item = results.find(item => item.id === selectedItemId);
      if (item) {
        setEditingItem({ ...item });
        setIsEditing(true);
      }
    }
  };

  // 編集モードのキャンセル
  const cancelEditing = () => {
    setEditingItem(null);
    setIsEditing(false);
  };

  // 編集内容の保存
  const saveEditing = () => {
    if (editingItem) {
      setResults(prev =>
        prev.map(item =>
          item.id === editingItem.id ? editingItem : item
        )
      );
      setEditingItem(null);
      setIsEditing(false);
    }
  };

  // 編集中のアイテムの更新
  const updateEditingItem = (field: keyof EditableScrapingResultItem, value: any) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  // 内部リンクの更新
  const updateInternalLink = (index: number, value: string) => {
    if (editingItem && editingItem.internal_links) {
      const newLinks = [...editingItem.internal_links];
      newLinks[index] = value;
      setEditingItem({ ...editingItem, internal_links: newLinks });
    }
  };

  // 内部リンクの追加
  const addInternalLink = () => {
    if (editingItem) {
      const newLinks = editingItem.internal_links ? [...editingItem.internal_links, ""] : [""];
      setEditingItem({ ...editingItem, internal_links: newLinks });
    }
  };

  // 内部リンクの削除
  const removeInternalLink = (index: number) => {
    if (editingItem && editingItem.internal_links) {
      const newLinks = [...editingItem.internal_links];
      newLinks.splice(index, 1);
      setEditingItem({ ...editingItem, internal_links: newLinks });
    }
  };

  // 見出しの更新（再帰的）
  const updateHeading = useCallback((headings: HeadingItem[], path: number[], field: keyof HeadingItem, value: string): HeadingItem[] => {
    if (path.length === 0) return headings;

    const index = path[0];
    const newHeadings = [...headings];

    if (path.length === 1) {
      newHeadings[index] = { ...newHeadings[index], [field]: value };
    } else {
      const newPath = path.slice(1);
      if (newHeadings[index].children) {
        newHeadings[index] = {
          ...newHeadings[index],
          children: updateHeading(newHeadings[index].children || [], newPath, field, value)
        };
      }
    }

    return newHeadings;
  }, []);

  // 見出しの更新ハンドラー
  const handleHeadingUpdate = (path: number[], field: keyof HeadingItem, value: string) => {
    if (editingItem && editingItem.headings) {
      const newHeadings = updateHeading(editingItem.headings, path, field, value);
      setEditingItem({ ...editingItem, headings: newHeadings });
    }
  };

  // 選択されているアイテムを取得
  const selectedItem = editingItem || results.find(item => item.id === selectedItemId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
                スクレイピング結果
              </span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              取得した{results.length}件のデータを編集・管理できます
            </p>
          </div>

          <div className="flex space-x-4">
            <Button
              onClick={() => navigate("/scrapying")}
              className="mt-4 md:mt-0 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              スクレイピング画面に戻る
            </Button>
            
            <Button
              onClick={saveAllResultsToBackend}
              disabled={isLoading || results.length === 0}
              className="mt-4 md:mt-0 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </div>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                  </svg>
                  結果を保存する
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map(item => (
            <div
              key={item.id}
              className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
              onClick={() => {
                setSelectedItemId(item.id);
                setIsEditing(false);
                setIsDialogOpen(true);
              }}
            >
              {/* コンテンツ部分 */}
              <div className="flex-grow p-6 dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {item.title || "タイトルなし"}
                </h2>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3 block truncate"
                >
                  {item.url}
                </a>

                <div className="mt-3 text-gray-600 dark:text-gray-300 text-sm line-clamp-4 h-20 overflow-hidden">
                  {item.content || "コンテンツなし"}
                </div>
              </div>

              {/* フッター部分（常に最下部） */}
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between mt-auto">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.index_status === "index"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                >
                  {item.index_status === "index" ? "インデックス" : "ノーインデックス"}
                </span>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {item.internal_links?.length || 0} リンク
                </span>
              </div>
            </div>
          ))}
        </div>

        {apiError && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 animate-fade-in">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">エラーが発生しました</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {apiError}
                </div>
              </div>
            </div>
          </div>
        )}

        {results.length === 0 && !isLoading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center animate-fade-in">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">データがありません</h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">スクレイピングを実行して結果を取得してください</p>
            <Button
              onClick={() => navigate("/scrapying")}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white"
            >
              スクレイピング画面へ
            </Button>
          </div>
        )}
      </div>

      {/* 詳細表示・編集用モーダル */}
      {selectedItem && (
        <ScrapingResultModal
          item={selectedItem}
          isOpen={isDialogOpen}
          setOpen={setIsDialogOpen}
          isEditing={isEditing}
          startEditing={startEditing}
          cancelEditing={cancelEditing}
          saveEditing={() => {
            saveEditing();
            setIsDialogOpen(false);
          }}
          updateEditingItem={updateEditingItem}
          updateInternalLink={updateInternalLink}
          addInternalLink={addInternalLink}
          removeInternalLink={removeInternalLink}
          handleHeadingUpdate={handleHeadingUpdate}
          deleteItem={deleteItem}
        />
      )}
    </div>
  );
}
