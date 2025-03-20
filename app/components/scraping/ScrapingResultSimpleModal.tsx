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
import { X, ExternalLink } from "lucide-react";
import type { SimpleScrapingResultItem } from "~/atoms/scrapingResults";
import { Badge } from "~/components/ui/badge";

interface ScrapingResultSimpleModalProps {
  item: SimpleScrapingResultItem;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export function ScrapingResultSimpleModal({
  item,
  isOpen,
  setOpen,
}: ScrapingResultSimpleModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.title || "タイトルなし"}
            </DialogTitle>
          </div>

          <DialogDescription className="text-gray-500 dark:text-gray-400">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
            >
              {item.url}
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 基本情報 */}
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">基本情報</h3>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">インデックス状態</p>
                  <Badge 
                    variant={item.index_status === "index" ? "default" : "destructive"}
                    className={item.index_status === "index" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mt-1" : "mt-1"}
                  >
                    {item.index_status === "index" ? "インデックス" : "ノーインデックス"}
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">内部リンク数</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.internal_links_count}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">見出し数</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.headings_count}</p>
                </div>
              </div>
            </div>
          </div>

          {/* コンテンツ */}
          <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">コンテンツ</h3>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                {item.content || "コンテンツなし"}
              </p>
            </div>
          </div>
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
