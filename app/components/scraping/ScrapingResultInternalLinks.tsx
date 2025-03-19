import { useState } from "react";
import type { EditableScrapingResultItem, InternalLinkItem } from "~/atoms/scrapingResults";
import { Button } from "~/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";

interface Props {
  item: EditableScrapingResultItem;
  onUpdate?: () => Promise<void>;
  onDeleteLink?: (linkId: number) => Promise<void>;
}

export function ScrapingResultInternalLinks({ item, onUpdate, onDeleteLink }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [deletingLinkIds, setDeletingLinkIds] = useState<number[]>([]);

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
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteLink = async (linkId: number | undefined, index: number) => {
    if (!linkId || !onDeleteLink) return;
    
    setDeletingLinkIds(prev => [...prev, linkId]);
    try {
      await onDeleteLink(linkId);
    } finally {
      setDeletingLinkIds(prev => prev.filter(id => id !== linkId));
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">内部リンク</h3>
        {onUpdate && (
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
        )}
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        {item.internal_links && item.internal_links.length > 0 ? (
          <ul className="space-y-2">
            {item.internal_links.map((link, index) => {
              const url = getInternalLinkUrl(link);
              const linkId = getInternalLinkId(link);
              const isDeleting = linkId ? deletingLinkIds.includes(linkId) : false;
              
              return (
                <li key={index} className="flex items-center justify-between text-gray-700 dark:text-gray-300 break-all">
                  <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 dark:text-blue-400 hover:underline flex-grow"
                  >
                    {url}
                  </a>
                  
                  {onDeleteLink && linkId && (
                    <Button
                      onClick={() => handleDeleteLink(linkId, index)}
                      variant="outline"
                      size="sm"
                      disabled={isDeleting}
                      className="ml-2 text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className={`h-4 w-4 ${isDeleting ? 'animate-pulse' : ''}`} />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">内部リンクはありません</div>
        )}
      </div>
    </div>
  );
}
