import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { PlusCircle, Trash2, RefreshCw } from "lucide-react";
import type { EditableScrapingResultItem, InternalLinkItem } from "~/atoms/scrapingResults";

interface Props {
  item: EditableScrapingResultItem;
  updateInternalLink: (index: number, value: string) => void;
  addInternalLink: () => void;
  removeInternalLink: (index: number) => void;
  onUpdate?: () => Promise<void>;
  onDeleteLink?: (linkId: number) => Promise<void>;
}

export function ScrapingResultInternalLinksEdit({
  item,
  updateInternalLink,
  addInternalLink,
  removeInternalLink,
  onUpdate,
  onDeleteLink,
}: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [originalLinks, setOriginalLinks] = useState<(string | InternalLinkItem)[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // 初期値を保存
  useEffect(() => {
    if (item?.internal_links) {
      // ディープコピーを作成
      const deepCopy = item.internal_links.map(link => {
        if (typeof link === 'string') {
          return link;
        } else {
          return { ...link };
        }
      });
      setOriginalLinks(deepCopy);
    }
  }, []);

  // 変更を検知
  useEffect(() => {
    if (originalLinks.length === 0 || !item?.internal_links) return;
    
    // リンクの数が変わった場合
    if (originalLinks.length !== item.internal_links.length) {
      setHasChanges(true);
      return;
    }
    
    // リンクの内容が変わった場合
    const hasContentChanges = item.internal_links.some((link, index) => {
      const originalLink = originalLinks[index];
      const currentUrl = typeof link === 'string' ? link : link.url;
      const originalUrl = typeof originalLink === 'string' ? originalLink : originalLink.url;
      return currentUrl !== originalUrl;
    });
    
    setHasChanges(hasContentChanges);
  }, [item.internal_links, originalLinks]);

  // 内部リンクのURLを取得する関数
  const getInternalLinkUrl = (link: string | InternalLinkItem): string => {
    return typeof link === 'string' ? link : link.url;
  };

  // 内部リンクのIDを取得する関数
  const getInternalLinkId = (link: string | InternalLinkItem): number | undefined => {
    return typeof link === 'string' ? undefined : link.id;
  };

  const handleUpdate = async () => {
    if (!onUpdate) return;
    
    setIsUpdating(true);
    try {
      await onUpdate();
      // 更新が成功したら、現在の値を新しい初期値として保存
      if (item?.internal_links) {
        const deepCopy = item.internal_links.map(link => {
          if (typeof link === 'string') {
            return link;
          } else {
            return { ...link };
          }
        });
        setOriginalLinks(deepCopy);
        setHasChanges(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (index: number) => {
    const link = item.internal_links[index];
    const linkId = getInternalLinkId(link);
    
    // IDがある場合はAPIで削除
    if (linkId && onDeleteLink) {
      setDeletingIndex(index);
      try {
        await onDeleteLink(linkId);
      } finally {
        setDeletingIndex(null);
      }
    }
    
    // UIから削除（IDがない場合や、APIでの削除が成功した場合）
    removeInternalLink(index);
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">内部リンク</h3>
        <div className="flex space-x-2">
          {onUpdate && (
            <Button
              onClick={handleUpdate}
              variant="outline"
              size="sm"
              disabled={isUpdating || !hasChanges}
              className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
              更新
            </Button>
          )}
          <Button
            onClick={addInternalLink}
            variant="outline"
            size="sm"
            className="text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            追加
          </Button>
        </div>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        {item?.internal_links && item.internal_links.length > 0 ? (
          <div className="space-y-3">
            {item.internal_links.map((link, index) => {
              const url = getInternalLinkUrl(link);
              const isDeleting = deletingIndex === index;
              
              return (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor={`internal-link-${index}`}>リンク {index + 1}</Label>
                    <div className="flex space-x-2">
                      <Input
                        id={`internal-link-${index}`}
                        value={url}
                        onChange={(e) => updateInternalLink(index, e.target.value)}
                      />
                      <Button
                        onClick={() => handleDelete(index)}
                        variant="outline"
                        size="icon"
                        disabled={isDeleting}
                        className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                      >
                        <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            内部リンクがありません。「追加」ボタンをクリックして追加してください。
          </div>
        )}
      </div>
    </div>
  );
}
