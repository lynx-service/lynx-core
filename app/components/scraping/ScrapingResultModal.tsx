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
import { X } from "lucide-react";
import type { ArticleItem } from "~/types/article";
import { ScrapingResultDisplay } from "./ScrapingResultDisplay";

interface Props {
  item: ArticleItem;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

export function ScrapingResultModal({
  item,
  isOpen,
  setOpen,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {item.metaTitle || "タイトルなし"}
          </DialogTitle>
          <DialogDescription className="text-gray-500 dark:text-gray-400">
            <a
              href={item.articleUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              {item.articleUrl}
            </a>
          </DialogDescription>
        </DialogHeader>

        <ScrapingResultDisplay item={item} />

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
