import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { PlusCircle, Trash2 } from "lucide-react";
import type { EditableScrapingResultItem } from "~/atoms/scrapingResults";

interface Props {
  item: EditableScrapingResultItem;
  updateInternalLink: (index: number, value: string) => void;
  addInternalLink: () => void;
  removeInternalLink: (index: number) => void;
}

export function ScrapingResultInternalLinksEdit({
  item,
  updateInternalLink,
  addInternalLink,
  removeInternalLink,
}: Props) {
  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">内部リンク</h3>
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
      <div className="p-4 bg-white dark:bg-gray-800">
        {item?.internal_links && item.internal_links.length > 0 ? (
          <div className="space-y-3">
            {item.internal_links.map((link, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor={`internal-link-${index}`}>リンク {index + 1}</Label>
                  <div className="flex space-x-2">
                    <Input
                      id={`internal-link-${index}`}
                      value={link}
                      onChange={(e) => updateInternalLink(index, e.target.value)}
                    />
                    <Button
                      onClick={() => removeInternalLink(index)}
                      variant="outline"
                      size="icon"
                      className="text-red-600 dark:text-red-400 border-red-600 dark:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
