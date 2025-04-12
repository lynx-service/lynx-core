import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Pencil, Trash2, X } from "lucide-react";
import type { ArticleItem, HeadingItem } from "~/atoms/articles";
import { ArticleBasicInfo } from "./ArticleBasicInfo";
import { ArticleBasicInfoEdit } from "./ArticleBasicInfoEdit";
import { ArticleInternalLinks } from "./ArticleInternalLinks";
import { ArticleInternalLinksEdit } from "./ArticleInternalLinksEdit";
import { ArticleHeadings } from "./ArticleHeadings";
import { useState } from "react";

interface ArticleModalProps {
  item: ArticleItem;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isEditing: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  updateEditingItem: (field: keyof ArticleItem, value: any) => void;
  updateInternalLink: (index: number, value: string) => void;
  addInternalLink: () => void;
  removeInternalLink: (index: number) => void;
  handleHeadingUpdate: (path: number[], field: keyof HeadingItem, value: string) => void;
  deleteItem: (id: string) => void;
  onUpdateBasicInfo?: (item: ArticleItem) => Promise<void>;
  onUpdateInternalLinks?: (item: ArticleItem) => Promise<void>;
  onDeleteInternalLink?: (linkId: number) => Promise<void>;
  onUpdateHeadings?: (item: ArticleItem) => Promise<void>;
}

export function ArticleModal({
  item,
  isOpen,
  setOpen,
  isEditing,
  startEditing,
  cancelEditing,
  updateEditingItem,
  updateInternalLink,
  addInternalLink,
  removeInternalLink,
  handleHeadingUpdate,
  deleteItem,
  onUpdateBasicInfo,
  onUpdateInternalLinks,
  onDeleteInternalLink,
  onUpdateHeadings,
}: ArticleModalProps) {
  const [isUpdatingHeadings, setIsUpdatingHeadings] = useState(false);

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
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {isEditing ? "データの編集" : (item.title || "タイトルなし")}
            </DialogTitle>

            {!isEditing && (
              <Button
                onClick={() => deleteItem(item.id)}
                variant="outline"
                size="sm"
                className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                削除
              </Button>
            )}
          </div>

          {!isEditing && (
            <DialogDescription className="text-gray-500 dark:text-gray-400">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {item.url}
              </a>
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-end space-x-2">
            {!isEditing ? (
              <Button
                onClick={startEditing}
                variant="outline"
                className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <Pencil className="h-4 w-4 mr-1" />
                編集
              </Button>
            ) : (
              <Button
                onClick={cancelEditing}
                variant="outline"
                className="text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30"
              >
                <X className="h-4 w-4 mr-1" />
                キャンセル
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-6">
              <ArticleBasicInfoEdit
                item={item}
                updateEditingItem={updateEditingItem}
                onUpdate={onUpdateBasicInfo}
              />
              <ArticleInternalLinksEdit
                item={item}
                updateInternalLink={updateInternalLink}
                addInternalLink={addInternalLink}
                removeInternalLink={removeInternalLink}
                onUpdate={onUpdateInternalLinks}
                onDeleteLink={onDeleteInternalLink}
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
                      <span className={`h-4 w-4 mr-1 ${isUpdatingHeadings ? 'animate-spin' : ''}`}>⟳</span>
                      更新
                    </Button>
                  </div>
                  <div className="p-4 bg-white dark:bg-gray-800">
                    <ArticleHeadings item={item} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <ArticleBasicInfo item={item} />
              <ArticleInternalLinks item={item} />
              <ArticleHeadings item={item} />
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              className="text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30"
            >
              <X className="h-4 w-4 mr-1" />
              閉じる
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
