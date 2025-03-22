import type { ArticleItem } from "~/types/article";
import { ScrapingResultBasicInfo } from "./ScrapingResultBasicInfo";
import { ScrapingResultHeadings } from "./ScrapingResultHeadings";
import { ScrapingResultInternalLinks } from "./ScrapingResultInternalLinks";

interface Props {
  item: ArticleItem;
}

export function ScrapingResultDisplay({ item }: Props) {
  return (
    <div className="space-y-6 py-4">
      {/* 基本情報セクション */}
      <ScrapingResultBasicInfo item={item} />

      {/* 内部リンクセクション */}
      {item.internalLinks && item.internalLinks.length > 0 && (
        <ScrapingResultInternalLinks item={item} />
      )}

      {/* 見出し構造セクション */}
      {item.headings && item.headings.length > 0 && (
        <ScrapingResultHeadings item={item} />
      )}

      {/* JSON表示セクション */}
      <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">すべてのデータ（JSON）</h3>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-900 overflow-x-auto">
          <pre className="text-xs text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
            {JSON.stringify(item, null, 2)}
          </pre>
        </div>
      </div>
    </div>

  );
}
