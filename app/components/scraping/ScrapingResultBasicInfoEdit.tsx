import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import type { EditableScrapingResultItem } from "~/atoms/scrapingResults";

interface Props {
  item: EditableScrapingResultItem;
  updateEditingItem: (field: keyof EditableScrapingResultItem, value: any) => void;
}

export function ScrapingResultBasicInfoEdit({ item, updateEditingItem }: Props) {
  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">基本情報</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 space-y-4">
        {/* URL */}
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={item?.url || ""}
            onChange={(e) => updateEditingItem('url', e.target.value)}
          />
        </div>
        
        {/* タイトル */}
        <div className="space-y-2">
          <Label htmlFor="title">タイトル</Label>
          <Input
            id="title"
            value={item?.title || ""}
            onChange={(e) => updateEditingItem('title', e.target.value)}
          />
        </div>
        
        {/* 説明文 */}
        <div className="space-y-2">
          <Label htmlFor="content">説明文（メタディスクリプション）</Label>
          <Textarea
            id="content"
            value={item?.content || ""}
            onChange={(e) => updateEditingItem('content', e.target.value)}
            className="min-h-[100px]"
            placeholder="説明文を入力してください"
          />
        </div>
        
        {/* インデックス状態 */}
        <div className="space-y-2">
          <Label>インデックス状態</Label>
          <RadioGroup
            value={item?.index_status || 'noindex'}
            onValueChange={(value) => updateEditingItem('index_status', value)}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="index" id="index" />
              <Label htmlFor="index" className="font-normal">インデックス</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="noindex" id="noindex" />
              <Label htmlFor="noindex" className="font-normal">ノーインデックス</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
