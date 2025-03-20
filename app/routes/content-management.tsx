import type { Route } from "./+types/home";
import { useLoaderData, useNavigate } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { useState } from "react";
import { ScrapingResultModal } from "~/components/scraping/ScrapingResultModal";
import { ScrapingResultHeader } from "~/components/scraping/ScrapingResultHeader";
import { ScrapingResultList } from "~/components/scraping/ScrapingResultList";
import { ScrapingErrorDisplay } from "~/components/scraping/ScrapingErrorDisplay";
import { convertToEditableItem } from "~/utils/scraping-utils";
import {
  updateArticle,
  updateInternalLinks,
  updateHeadings,
  deleteItem,
  deleteInternalLink
} from "~/services/scraping-api.service";
import type { EditableScrapingResultItem, HeadingItem, InternalLinkItem } from "~/atoms/scrapingResults";

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

export default function ContentManagement() {
  const { user, token, refreshToken, contentItems, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableScrapingResultItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(error);
  
  // DBから取得したデータをEditableScrapingResultItem形式に変換
  const results = contentItems && Array.isArray(contentItems) && contentItems.length > 0
    ? contentItems.map(convertToEditableItem)
    : [];

  // 項目の削除
  const handleDeleteItem = async (id: string) => {
    if (!token) {
      setApiError("認証情報が見つかりません");
      return false;
    }

    const item = results.find(item => item.id === id);
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

  // 編集中のアイテムの更新
  const updateEditingItem = (field: keyof EditableScrapingResultItem, value: any) => {
    if (editingItem) {
      setEditingItem({ ...editingItem, [field]: value });
    }
  };

  // 内部リンクの更新
  const updateInternalLink = (index: number, value: string) => {
    if (editingItem && editingItem.internal_links) {
      const newLinks = [...editingItem.internal_links] as InternalLinkItem[];
      if (typeof newLinks[index] === 'string') {
        newLinks[index] = { url: value };
      } else {
        (newLinks[index] as InternalLinkItem).url = value;
      }
      setEditingItem({ ...editingItem, internal_links: newLinks });
    }
  };

  // 内部リンクの追加
  const addInternalLink = () => {
    if (editingItem) {
      const newLinks = [...(editingItem.internal_links as InternalLinkItem[]), { url: "" }];
      setEditingItem({ ...editingItem, internal_links: newLinks });
    }
  };

  // 内部リンクの削除
  const removeInternalLink = (index: number) => {
    if (editingItem && editingItem.internal_links) {
      const newLinks = [...editingItem.internal_links] as InternalLinkItem[];

      // DBに保存されている内部リンクの場合、APIで削除
      const link = newLinks[index];
      if (typeof link !== 'string' && link.id && token) {
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
  const selectedItem = editingItem || results.find(item => item.id === selectedItemId);

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
  const handleUpdateBasicInfo = async (item: EditableScrapingResultItem) => {
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
  const handleUpdateInternalLinks = async (item: EditableScrapingResultItem) => {
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
  const handleUpdateHeadings = async (item: EditableScrapingResultItem) => {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ScrapingResultHeader
          resultsCount={results.length}
          onBack={handleBack}
          onSave={() => {}} // 空の関数を渡す
          isLoading={isLoading}
          disableSave={true} // 保存ボタンを無効化
          title="コンテンツ管理"
          backText="ダッシュボードに戻る"
        />

        <ScrapingResultList
          results={results}
          onSelectItem={handleSelectItem}
          isLoading={isLoading}
        />

        {apiError && <ScrapingErrorDisplay error={apiError} />}

        {selectedItem && (
          <ScrapingResultModal
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
