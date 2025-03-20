import { useState } from "react";
import type { ArticleItem, InternalLinkItem } from "~/atoms/articles";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { RefreshCw, Plus, Trash2 } from "lucide-react";

interface ArticleInternalLinksEditProps {
  item: ArticleItem;
  updateInternalLink: (index: number, value: string) => void;
  addInternalLink: () => void;
  removeInternalLink: (index: number) => void;
  onUpdate?: (item: ArticleItem) => Promise<void>;
  onDeleteLink?: (linkId: number) => Promise<void>;
}

export function ArticleInternalLinksEdit({
  item,
  updateInternalLink,
  addInternalLink,
  removeInternalLink,
  onUpdate,
  onDeleteLink
}: ArticleInternalLinksEditProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // 内部リンクの更新
  const handleUpdate = async () => {
    if (!onUpdate) return;

    setIsUpdating(true);
    try {
      await onUpdate(item);
    } catch (error) {
      console.error("Failed to update internal links:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // 内部リンクの削除
  const handleDeleteLink = async (index: number) => {
    const link = item.internal_links[index];
    
    // DBに保存されている内部リンクの場合、APIで削除
    if (link.id && onDeleteLink) {
      try {
        await onDeleteLink(link.id);
      } catch (error) {
        console.error("Failed to delete internal link:", error);
        return;
      }
    }
    
    // UIから削除
    removeInternalLink(index);
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">内部リンク</h3>
        <div className="flex space-x-2">
          <Button
            onClick={addInternalLink}
            variant="outline"
            size="sm"
            className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
          >
            <Plus className="h-4 w-4 mr-1" />
            追加
          </Button>
          <Button
            onClick={handleUpdate}
            variant="outline"
            size="sm"
            disabled={isUpdating}
            className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        {item.internal_links && item.internal_links.length > 0 ? (
          <ul className="space-y-3">
            {item.internal_links.map((link, index) => (
              <li key={index} className="flex items-center space-x-2">
                <span className="text-gray-500 dark:text-gray-400 w-6 flex-shrink-0">{index + 1}.</span>
                <Input
                  value={link.url}
                  onChange={(e) => updateInternalLink(index, e.target.value)}
                  className="flex-grow"
                  placeholder="https://example.com/page"
                />
                <Button
                  onClick={() => handleDeleteLink(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400 mb-2">内部リンクはありません</p>
            <Button
              onClick={addInternalLink}
              variant="outline"
              size="sm"
              className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/30"
            >
              <Plus className="h-4 w-4 mr-1" />
              内部リンクを追加
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
