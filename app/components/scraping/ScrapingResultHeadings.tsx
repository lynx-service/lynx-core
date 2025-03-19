import { useState } from "react";
import type { EditableScrapingResultItem } from "~/atoms/scrapingResults";
import { HeadingList } from "./HeadingList";
import { Button } from "~/components/ui/button";
import { RefreshCw } from "lucide-react";

interface Props {
  item: EditableScrapingResultItem;
  onUpdate?: () => Promise<void>;
}

export function ScrapingResultHeadings({ item, onUpdate }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!onUpdate) return;
    
    setIsUpdating(true);
    try {
      await onUpdate();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">見出し構造</h3>
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
        {item.headings && item.headings.length > 0 ? (
          <HeadingList headings={item.headings} />
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            見出しがありません
          </div>
        )}
      </div>
    </div>
  );
}
