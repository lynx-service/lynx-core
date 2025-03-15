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
import { Pencil, Save, Trash2, X } from "lucide-react";
import type { EditableScrapingResultItem, HeadingItem } from "~/atoms/scrapingResults";
import { ScrapingResultModalContent } from "./ScrapingResultModalContent";

interface Props {
  item: EditableScrapingResultItem;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  isEditing: boolean;
  startEditing: () => void;
  cancelEditing: () => void;
  saveEditing: () => void;
  updateEditingItem: (field: keyof EditableScrapingResultItem, value: any) => void;
  updateInternalLink: (index: number, value: string) => void;
  addInternalLink: () => void;
  removeInternalLink: (index: number) => void;
  handleHeadingUpdate: (path: number[], field: keyof HeadingItem, value: string) => void;
  deleteItem: (id: string) => void;
}

export function ScrapingResultModal({
  item,
  isOpen,
  setOpen,
  isEditing,
  startEditing,
  cancelEditing,
  saveEditing,
  updateEditingItem,
  updateInternalLink,
  addInternalLink,
  removeInternalLink,
  handleHeadingUpdate,
  deleteItem,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? "データの編集" : (item.title || "タイトルなし")}
          </DialogTitle>
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
          onSave={saveEditing}
          onCancel={cancelEditing}
        />

        <DialogFooter>
          {isEditing ? (
            <>
              <Button
                onClick={saveEditing}
                variant="outline"
                className="text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
              >
                <Save className="h-4 w-4 mr-1" />
                保存
              </Button>
              <Button
                onClick={cancelEditing}
                variant="outline"
                className="text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30"
              >
                <X className="h-4 w-4 mr-1" />
                キャンセル
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => deleteItem(item.id)}
                variant="outline"
                className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                削除
              </Button>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  className="text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                >
                  <X className="h-4 w-4 mr-1" />
                  閉じる
                </Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
