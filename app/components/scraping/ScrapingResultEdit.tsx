import { Textarea } from "~/components/ui/textarea";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import type { EditableScrapingResultItem, HeadingItem } from "~/atoms/scrapingResults";
import { EditableHeadingList } from "./EditableHeadingList";

interface Props {
  item: EditableScrapingResultItem;
  updateEditingItem: (field: keyof EditableScrapingResultItem, value: any) => void;
  updateInternalLink: (index: number, value: string) => void;
  addInternalLink: () => void;
  removeInternalLink: (index: number) => void;
  handleHeadingUpdate: (path: number[], field: keyof HeadingItem, value: string) => void;
}

export function ScrapingResultEdit({
  item,
  updateEditingItem,
  updateInternalLink,
  addInternalLink,
  removeInternalLink,
  handleHeadingUpdate,
}: Props) {
  return (
    <div className="space-y-6 py-4">
      {/* 基本情報編集 */}
      <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">基本情報</h3>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <Input
              value={item?.url || ""}
              onChange={(e) => updateEditingItem("url", e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              タイトル
            </label>
            <Input
              value={item?.title || ""}
              onChange={(e) => updateEditingItem("title", e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* 説明文 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              説明文（メタディスクリプション）
            </label>
            <Textarea
              value={item?.content || ""}
              onChange={(e) => updateEditingItem("content", e.target.value)}
              className="min-h-[100px] bg-white dark:bg-gray-700 dark:text-white"
              placeholder="説明文を入力してください"
            />
          </div>

          {/* インデックス状態 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              インデックス状態
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-emerald-500 focus:ring-emerald-500 dark:focus:ring-emerald-400"
                  checked={item?.index_status === "index"}
                  onChange={() => updateEditingItem("index_status", "index")}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">インデックス</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-red-500 focus:ring-red-500 dark:focus:ring-red-400"
                  checked={item?.index_status !== "index"}
                  onChange={() => updateEditingItem("index_status", "noindex")}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">ノーインデックス</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 内部リンク編集 */}
      <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">内部リンク</h3>
          <Button
            onClick={addInternalLink}
            className="h-8 px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs"
          >
            追加
          </Button>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800">
          {Array.isArray(item?.internal_links) && item.internal_links.length > 0 ? (
            <div className="space-y-3">
              {item.internal_links.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={link}
                    onChange={(e) => updateInternalLink(index, e.target.value)}
                    className="flex-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                  <Button
                    onClick={() => removeInternalLink(index)}
                    className="h-8 px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs"
                  >
                    削除
                  </Button>
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

      {/* 見出し構造編集 */}
      {Array.isArray(item?.headings) && item.headings.length > 0 && (
        <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">見出し構造</h3>
          </div>
          <div className="p-4 bg-white dark:bg-gray-800">
            <div className="space-y-2">
              <EditableHeadingList
                headings={item.headings}
                path={[]}
                onUpdate={handleHeadingUpdate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
