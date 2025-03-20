import { useState } from "react";
import type { ArticleItem } from "~/atoms/articles";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { RefreshCw } from "lucide-react";

interface ArticleBasicInfoEditProps {
  item: ArticleItem;
  updateEditingItem: (field: keyof ArticleItem, value: any) => void;
  onUpdate?: (item: ArticleItem) => Promise<void>;
}

export function ArticleBasicInfoEdit({ 
  item, 
  updateEditingItem,
  onUpdate
}: ArticleBasicInfoEditProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // 基本情報の更新
  const handleUpdate = async () => {
    if (!onUpdate) return;

    setIsUpdating(true);
    try {
      await onUpdate(item);
    } catch (error) {
      console.error("Failed to update basic info:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">基本情報</h3>
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
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-gray-500 dark:text-gray-400">タイトル</Label>
            <Input
              id="title"
              value={item.title}
              onChange={(e) => updateEditingItem('title', e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="url" className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</Label>
            <Input
              id="url"
              value={item.url}
              onChange={(e) => updateEditingItem('url', e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">インデックス状態</p>
            <RadioGroup 
              value={item.index_status} 
              onValueChange={(value) => updateEditingItem('index_status', value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="index" id="index" />
                <Label htmlFor="index" className="text-sm">インデックス</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="noindex" id="noindex" />
                <Label htmlFor="noindex" className="text-sm">ノーインデックス</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="content" className="text-sm font-medium text-gray-500 dark:text-gray-400">コンテンツ</Label>
            <Textarea
              id="content"
              value={item.content}
              onChange={(e) => updateEditingItem('content', e.target.value)}
              className="mt-1 min-h-[150px]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
