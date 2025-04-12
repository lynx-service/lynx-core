import type { ArticleItem } from "~/atoms/articles";
import { Badge } from "~/components/ui/badge";

interface ArticleBasicInfoProps {
  item: ArticleItem;
}

export function ArticleBasicInfo({ item }: ArticleBasicInfoProps) {
  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">基本情報</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">タイトル</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">{item.title || "タイトルなし"}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</p>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-1 block break-all"
            >
              {item.url}
            </a>
          </div>
          
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
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">コンテンツ</p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">
              {item.content || "コンテンツなし"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
