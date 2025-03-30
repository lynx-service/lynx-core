import type { ArticleItem } from "~/types/article";
import { FileText, Globe, Info } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface Props {
  item: ArticleItem;
}

export function ScrapingResultBasicInfo({ item }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-background px-4 py-2 border-b flex items-center">
        <Info className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">基本情報</h3>
      </div>
      <div className="p-4 bg-background">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {/* URL */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">URL</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 break-all overflow-wrap-anywhere">
              <a
                href={item.articleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline break-all overflow-wrap-anywhere"
              >
                {item.articleUrl}
              </a>
            </dd>
          </div>

          {/* タイトル */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">タイトル</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 break-words">
              {item.metaTitle || "タイトルなし"}
            </dd>
          </div>

          {/* 説明文 */}
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">説明文（メタディスクリプション）</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 whitespace-pre-wrap break-words overflow-wrap-anywhere">
              {item.metaDescription || "説明文なし"}
            </dd>
          </div>

          {/* インデックス状態 */}
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">インデックス状態</dt>
            <dd className="mt-1">
              <Badge 
                variant={item.isIndexable ? "default" : "destructive"}
                className={item.isIndexable
                  ? "bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40"
                  : "bg-red-100 hover:bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40"
                }
              >
                {item.isIndexable ? 'インデックス' : 'ノーインデックス'}
              </Badge>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
