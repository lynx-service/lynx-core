import { useState, useEffect } from "react";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Button } from "~/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { EditableScrapingResultItem } from "~/atoms/scrapingResults";

interface Props {
  item: EditableScrapingResultItem;
  updateEditingItem: (field: keyof EditableScrapingResultItem, value: any) => void;
  onUpdate?: () => Promise<void>;
}

export function ScrapingResultBasicInfoEdit({ item, updateEditingItem, onUpdate }: Props) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [originalItem, setOriginalItem] = useState<Partial<EditableScrapingResultItem>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // 初期値を保存
  useEffect(() => {
    if (item) {
      setOriginalItem({
        url: item.url,
        title: item.title,
        content: item.content,
        index_status: item.index_status
      });
    }
  }, []);

  // 変更を検知
  useEffect(() => {
    if (!originalItem || !item) return;
    
    const hasUrlChanged = originalItem.url !== item.url;
    const hasTitleChanged = originalItem.title !== item.title;
    const hasContentChanged = originalItem.content !== item.content;
    const hasIndexStatusChanged = originalItem.index_status !== item.index_status;
    
    setHasChanges(hasUrlChanged || hasTitleChanged || hasContentChanged || hasIndexStatusChanged);
  }, [item, originalItem]);

  const handleUpdate = async () => {
    if (!onUpdate || !hasChanges) return;
    
    setIsUpdating(true);
    try {
      await onUpdate();
      // 更新が成功したら、現在の値を新しい初期値として保存
      if (item) {
        setOriginalItem({
          url: item.url,
          title: item.title,
          content: item.content,
          index_status: item.index_status
        });
        setHasChanges(false);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">基本情報</h3>
        {onUpdate && (
          <Button
            onClick={handleUpdate}
            variant="outline"
            size="sm"
            disabled={isUpdating || !hasChanges}
            className="text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
            更新
          </Button>
        )}
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
