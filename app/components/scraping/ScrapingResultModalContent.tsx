import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Pencil, X, RefreshCw } from "lucide-react";
import type { EditableScrapingResultItem, HeadingItem } from "~/atoms/scrapingResults";
import { ScrapingResultBasicInfo } from "./ScrapingResultBasicInfo";
import { ScrapingResultBasicInfoEdit } from "./ScrapingResultBasicInfoEdit";
import { ScrapingResultInternalLinks } from "./ScrapingResultInternalLinks";
import { ScrapingResultInternalLinksEdit } from "./ScrapingResultInternalLinksEdit";
import { ScrapingResultHeadings } from "./ScrapingResultHeadings";
import { EditableHeadingList } from "./EditableHeadingList";

interface Props {
  item: EditableScrapingResultItem;
  isEditing: boolean;
  startEditing: () => void;
  updateEditingItem: (field: keyof EditableScrapingResultItem, value: any) => void;
  updateInternalLink: (index: number, value: string) => void;
  addInternalLink: () => void;
  removeInternalLink: (index: number) => void;
  handleHeadingUpdate: (path: number[], field: keyof HeadingItem, value: string) => void;
  onCancel: () => void;
  onUpdateBasicInfo?: (item: EditableScrapingResultItem) => Promise<void>;
  onUpdateInternalLinks?: (item: EditableScrapingResultItem) => Promise<void>;
  onDeleteInternalLink?: (linkId: number) => Promise<void>;
  onUpdateHeadings?: (item: EditableScrapingResultItem) => Promise<void>;
  readOnly?: boolean; // 閲覧専用モードを追加
}

export function ScrapingResultModalContent({
  item,
  isEditing,
  startEditing,
  updateEditingItem,
  updateInternalLink,
  addInternalLink,
  removeInternalLink,
  onCancel,
  handleHeadingUpdate,
  onUpdateBasicInfo,
  onUpdateInternalLinks,
  onDeleteInternalLink,
  onUpdateHeadings,
  readOnly = false, // デフォルトは編集可能
}: Props) {
  const [isUpdatingBasicInfo, setIsUpdatingBasicInfo] = useState(false);
  const [isUpdatingInternalLinks, setIsUpdatingInternalLinks] = useState(false);
  const [isUpdatingHeadings, setIsUpdatingHeadings] = useState(false);

  // 基本情報の更新
  const handleUpdateBasicInfo = async () => {
    if (!onUpdateBasicInfo) return;

    setIsUpdatingBasicInfo(true);
    try {
      await onUpdateBasicInfo(item);
    } catch (error) {
      console.error("Failed to update basic info:", error);
    } finally {
      setIsUpdatingBasicInfo(false);
    }
  };

  // 内部リンクの更新
  const handleUpdateInternalLinks = async () => {
    if (!onUpdateInternalLinks) return;

    setIsUpdatingInternalLinks(true);
    try {
      await onUpdateInternalLinks(item);
    } catch (error) {
      console.error("Failed to update internal links:", error);
    } finally {
      setIsUpdatingInternalLinks(false);
    }
  };

  // 内部リンクの削除
  const handleDeleteInternalLink = async (linkId: number): Promise<void> => {
    if (!onDeleteInternalLink) return;

    try {
      await onDeleteInternalLink(linkId);

      // 成功したら、内部リンクをUIから削除
      const newLinks = item.internal_links.filter(link => {
        if (typeof link === 'string') return true;
        return link.id !== linkId;
      });

      updateEditingItem('internal_links', newLinks);
    } catch (error) {
      console.error("Failed to delete internal link:", error);
    }
  };

  // 見出しの更新
  const handleUpdateHeadings = async () => {
    if (!onUpdateHeadings) return;

    setIsUpdatingHeadings(true);
    try {
      await onUpdateHeadings(item);
    } catch (error) {
      console.error("Failed to update headings:", error);
    } finally {
      setIsUpdatingHeadings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        {!isEditing && !readOnly && (
          <Button
            onClick={startEditing}
            variant="outline"
            className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <Pencil className="h-4 w-4 mr-1" />
            編集
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          <ScrapingResultBasicInfoEdit
            item={item}
            updateEditingItem={updateEditingItem}
            onUpdate={handleUpdateBasicInfo}
          />
          <ScrapingResultInternalLinksEdit
            item={item}
            updateInternalLink={updateInternalLink}
            addInternalLink={addInternalLink}
            removeInternalLink={removeInternalLink}
            onUpdate={handleUpdateInternalLinks}
            onDeleteLink={handleDeleteInternalLink}
          />
          {item.headings && item.headings.length > 0 && (
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">見出し構造</h3>
                <Button
                  onClick={handleUpdateHeadings}
                  variant="outline"
                  size="sm"
                  disabled={isUpdatingHeadings}
                  className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isUpdatingHeadings ? 'animate-spin' : ''}`} />
                  更新
                </Button>
              </div>
              <div className="p-4 bg-white dark:bg-gray-800">
                <div className="space-y-2">
                  <EditableHeadingList
                    headings={item.headings}
                    path={[]}
                    onUpdate={handleHeadingUpdate}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <ScrapingResultBasicInfo
            item={item}
          />
          <ScrapingResultInternalLinks
            item={item}
          />
          <ScrapingResultHeadings
            item={item}
          />
        </div>
      )}
    </div>
  );
}
