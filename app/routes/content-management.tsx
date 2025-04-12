import type { Route } from "./+types/home";
import { useLoaderData, useNavigate } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { useState } from "react";
import { ArticleModal } from "~/components/article/ArticleModal";
import { ArticleList } from "~/components/article/ArticleList";
import {
  updateArticle,
  updateInternalLinks,
  updateHeadings,
  deleteItem,
  deleteInternalLink
} from "~/services/scraping-api.service";
import type { ArticleItem, HeadingItem, InternalLinkItem } from "~/atoms/articles";

// shadcn/uiコンポーネント
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AlertTriangle, ArrowLeft, Edit, Database } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "コンテンツ管理" },
    { name: "description", content: "保存されたコンテンツの管理" },
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
    // バックエンドAPIからコンテンツデータを取得
    const response = await fetch("http://localhost:3000/scraping", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const contentItems = await response.json();

    return { user, token, refreshToken, contentItems, error: null };
  } catch (error) {
    console.error("Failed to fetch content items:", error);
    return {
      user,
      token,
      refreshToken,
      contentItems: null,
      error: error instanceof Error ? error.message : "データの取得に失敗しました"
    };
  }
};

// DBから取得したデータをArticleItem形式に変換する関数
const convertToArticleItem = (item: any): ArticleItem => {
  // 内部リンクをInternalLinkItem形式に変換
  const internalLinks: InternalLinkItem[] = Array.isArray(item.internal_links)
    ? item.internal_links.map((link: any) => {
        if (typeof link === 'string') {
          return { url: link };
        }
        return { id: link.id, url: link.url };
      })
    : [];

  // 見出しをHeadingItem形式に変換（再帰的に処理）
  const convertHeadings = (headings: any[]): HeadingItem[] => {
    if (!headings || !Array.isArray(headings)) return [];
    
    return headings.map(h => ({
      id: h.id,
      tag: h.tag || '',
      text: h.text || '',
      children: convertHeadings(h.children || [])
    }));
  };

  return {
    id: item.id || String(Math.random()),
    originalId: item.originalId || item.id,
    url: item.url || '',
    title: item.title || '',
    content: item.content || item.description || '',
    index_status: item.index_status || 'unknown',
    internal_links: internalLinks,
    headings: convertHeadings(item.headings || []),
    isEditing: false
  };
};

export default function ContentManagement() {
  const { user, token, refreshToken, contentItems, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<ArticleItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(error);

  // DBから取得したデータをArticleItem形式に変換
  const articles = contentItems && Array.isArray(contentItems) && contentItems.length > 0
    ? contentItems.map(convertToArticleItem)
    : [];

  // 項目の削除
  const handleDeleteItem = async (id: string) => {
    if (!token) {
      setApiError("認証情報が見つかりません");
      return false;
    }

    const item = articles.find(item => item.id === id);
    if (!item || !item.originalId) {
      setApiError("削除する項目が見つかりません");
      return false;
    }

    setIsLoading(true);

    const { error: deleteError } = await deleteItem(token, item.originalId);

    if (deleteError) {
      setApiError(deleteError);
      setIsLoading(false);
      return false;
    }

    // 削除後にダイアログを閉じる
    setIsDialogOpen(false);
    setIsLoading(false);

    // 削除後にページをリロード
    navigate(".", { replace: true });

    return true;
  };

  // 編集モードの開始
  const startEditing = () => {
    if (selectedItemId) {
      const item = articles.find(item => item.id === selectedItemId);
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

  // 編集中のアイテムの更新
  const updateEditingItem = (field: keyof ArticleItem, value: any) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  // 内部リンクの更新
  const updateInternalLink = (index: number, value: string) => {
    if (editingItem && editingItem.internal_links) {
      const newLinks = [...editingItem.internal_links];
      newLinks[index].url = value;
      setEditingItem({ ...editingItem, internal_links: newLinks });
    }
  };

  // 内部リンクの追加
  const addInternalLink = () => {
    if (editingItem) {
      const newLinks = [...editingItem.internal_links, { url: "" }];
      setEditingItem({ ...editingItem, internal_links: newLinks });
    }
  };

  // 内部リンクの削除
  const removeInternalLink = (index: number) => {
    if (editingItem && editingItem.internal_links) {
      const newLinks = [...editingItem.internal_links];
      
      // DBに保存されている内部リンクの場合、APIで削除
      const link = newLinks[index];
      if (link.id && token) {
        deleteInternalLink(token, link.id).catch(error => {
          console.error("Failed to delete internal link:", error);
        });
      }

      newLinks.splice(index, 1);
      setEditingItem({ ...editingItem, internal_links: newLinks });

      // 成功した場合にアラートを表示
      alert("内部リンクを削除しました");
    }
  };

  // 見出しの更新ハンドラー
  const handleHeadingUpdate = (path: number[], field: keyof HeadingItem, value: string) => {
    if (editingItem && editingItem.headings) {
      // 見出しの更新処理は複雑なため、ユーティリティ関数を使用
      import("~/utils/scraping-utils").then(({ updateHeadingRecursive }) => {
        const newHeadings = updateHeadingRecursive(editingItem.headings, path, field, value);
        setEditingItem({ ...editingItem, headings: newHeadings });
      });
    }
  };

  // 選択されているアイテムを取得
  const selectedItem = editingItem || articles.find(item => item.id === selectedItemId);

  // ダッシュボードに戻る
  const handleBack = () => {
    navigate("/");
  };

  // 項目を選択
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  // 基本情報の更新
  const handleUpdateBasicInfo = async (item: ArticleItem) => {
    if (!token) {
      setApiError("認証情報が見つかりません");
      return;
    }

    setIsLoading(true);
    const { error } = await updateArticle(token, item);
    setIsLoading(false);

    if (error) {
      setApiError(error);
      return;
    }

    alert("基本情報を更新しました");

    // 更新後にページをリロード
    navigate(".", { replace: true });
  };

  // 内部リンクの更新
  const handleUpdateInternalLinks = async (item: ArticleItem) => {
    if (!token) {
      setApiError("認証情報が見つかりません");
      return;
    }

    setIsLoading(true);
    const { error } = await updateInternalLinks(token, item);
    setIsLoading(false);

    if (error) {
      setApiError(error);
      return;
    }

    alert("内部リンクを更新しました");

    // 更新後にページをリロード
    navigate(".", { replace: true });
  };

  // 内部リンクの削除
  const handleDeleteInternalLink = async (linkId: number) => {
    if (!token) {
      setApiError("認証情報が見つかりません");
      return;
    }

    setIsLoading(true);
    const { error } = await deleteInternalLink(token, linkId);
    setIsLoading(false);

    if (error) {
      setApiError(error);
      return;
    }

    // 削除後にページをリロード
    navigate(".", { replace: true });
  };

  // 見出しの更新
  const handleUpdateHeadings = async (item: ArticleItem) => {
    if (!token) {
      setApiError("認証情報が見つかりません");
      return;
    }

    setIsLoading(true);
    const { error } = await updateHeadings(token, item);
    setIsLoading(false);

    if (error) {
      setApiError(error);
      return;
    }

    alert("見出し構造を更新しました");

    // 更新後にページをリロード
    navigate(".", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
                コンテンツ管理
              </span>
            </h1>
            <p className="text-muted-foreground">
              保存された{articles.length}件のコンテンツを編集・管理できます
            </p>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </div>
        </div>

        {/* エラー表示 */}
        {apiError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>
              {apiError}
            </AlertDescription>
          </Alert>
        )}

        {/* 結果表示 */}
        {articles.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">コンテンツがありません</p>
              <Button
                variant="outline"
                onClick={handleBack}
                className="mt-4"
              >
                <Database className="mr-2 h-4 w-4" />
                ダッシュボードに戻る
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grid" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  グリッド表示
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  テーブル表示
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="grid" className="mt-0">
              <ArticleList
                articles={articles}
                onSelectItem={handleSelectItem}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="table" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>タイトル</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>インデックス状態</TableHead>
                        <TableHead>内部リンク数</TableHead>
                        <TableHead className="w-[100px]">アクション</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {articles.map(item => (
                        <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {item.title || "タイトルなし"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.url}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={item.index_status === "index" ? "default" : "destructive"}
                              className={item.index_status === "index" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
                            >
                              {item.index_status === "index" ? "インデックス" : "ノーインデックス"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.internal_links?.length || 0}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectItem(item.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* モーダル */}
        {selectedItem && (
          <ArticleModal
            isOpen={isDialogOpen}
            setOpen={setIsDialogOpen}
            item={selectedItem}
            isEditing={isEditing}
            startEditing={startEditing}
            cancelEditing={cancelEditing}
            deleteItem={handleDeleteItem}
            updateEditingItem={updateEditingItem}
            updateInternalLink={updateInternalLink}
            addInternalLink={addInternalLink}
            removeInternalLink={removeInternalLink}
            handleHeadingUpdate={handleHeadingUpdate}
            onUpdateBasicInfo={handleUpdateBasicInfo}
            onUpdateInternalLinks={handleUpdateInternalLinks}
            onDeleteInternalLink={handleDeleteInternalLink}
            onUpdateHeadings={handleUpdateHeadings}
          />
        )}
      </div>
    </div>
  );
}
