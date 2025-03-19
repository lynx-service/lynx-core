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
import type { EditableScrapingResultItem, HeadingItem } from "~/atoms/scrapingResults";
import { ScrapingResultModalContent } from "./ScrapingResultModalContent";

interface Props {
  item: EditableScrapingResultItem;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isEditing: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  updateEditingItem: (field: keyof EditableScrapingResultItem, value: any) => void;
  updateInternalLink: (index: number, value: string) => void;
  addInternalLink: () => void;
  removeInternalLink: (index: number) => void;
  handleHeadingUpdate: (path: number[], field: keyof HeadingItem, value: string) => void;
  deleteItem: (id: string) => void;
  onUpdateBasicInfo?: (item: EditableScrapingResultItem) => Promise<void>;
  onUpdateInternalLinks?: (item: EditableScrapingResultItem) => Promise<void>;
  onDeleteInternalLink?: (linkId: number) => Promise<void>;
  onUpdateHeadings?: (item: EditableScrapingResultItem) => Promise<void>;
}

export function ScrapingResultModal({
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
}: Props) {
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

        <ScrapingResultModalContent
          item={item}
          isEditing={isEditing}
          startEditing={startEditing}
          updateEditingItem={updateEditingItem}
          updateInternalLink={updateInternalLink}
          addInternalLink={addInternalLink}
          removeInternalLink={removeInternalLink}
          handleHeadingUpdate={handleHeadingUpdate}
          onCancel={cancelEditing}
          onUpdateBasicInfo={onUpdateBasicInfo}
          onUpdateInternalLinks={onUpdateInternalLinks}
          onDeleteInternalLink={onDeleteInternalLink}
          onUpdateHeadings={onUpdateHeadings}
        />

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
