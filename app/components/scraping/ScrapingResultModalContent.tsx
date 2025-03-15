import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Pencil, Save, X } from "lucide-react";
import type { EditableScrapingResultItem } from "~/atoms/scrapingResults";
import { ScrapingResultBasicInfo } from "./ScrapingResultBasicInfo";
import { ScrapingResultBasicInfoEdit } from "./ScrapingResultBasicInfoEdit";
import { ScrapingResultInternalLinks } from "./ScrapingResultInternalLinks";
import { ScrapingResultInternalLinksEdit } from "./ScrapingResultInternalLinksEdit";
import { ScrapingResultHeadings } from "./ScrapingResultHeadings";

interface Props {
  item: EditableScrapingResultItem;
  updateEditingItem: (field: keyof EditableScrapingResultItem, value: any) => void;
  updateInternalLink: (index: number, value: string) => void;
  addInternalLink: () => void;
  removeInternalLink: (index: number) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ScrapingResultModalContent({
  item,
  updateEditingItem,
  updateInternalLink,
  addInternalLink,
  removeInternalLink,
  onSave,
  onCancel,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        {isEditing ? (
          <>
            <Button
              onClick={() => {
                onSave();
                setIsEditing(false);
              }}
              variant="outline"
              className="text-emerald-600 dark:text-emerald-400 border-emerald-600 dark:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
            >
              <Save className="h-4 w-4 mr-1" />
              保存
            </Button>
            <Button
              onClick={() => {
                onCancel();
                setIsEditing(false);
              }}
              variant="outline"
              className="text-gray-600 dark:text-gray-400 border-gray-600 dark:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/30"
            >
              <X className="h-4 w-4 mr-1" />
              キャンセル
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
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
          />
          <ScrapingResultInternalLinksEdit
            item={item}
            updateInternalLink={updateInternalLink}
            addInternalLink={addInternalLink}
            removeInternalLink={removeInternalLink}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <ScrapingResultBasicInfo item={item} />
          <ScrapingResultInternalLinks item={item} />
          <ScrapingResultHeadings item={item} />
        </div>
      )}
    </div>
  );
}
