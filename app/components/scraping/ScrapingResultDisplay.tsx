import { useState } from "react";
import type { ArticleItem } from "~/types/article";
import { ScrapingResultBasicInfo } from "./ScrapingResultBasicInfo";
import { ScrapingResultHeadings } from "./ScrapingResultHeadings";
import { ScrapingResultInternalLinks } from "./ScrapingResultInternalLinks";
import { ScrapingResultOuterLinks } from "./ScrapingResultOuterLinks";
import { ScrapingResultJsonLd } from "./ScrapingResultJsonLd";

interface Props {
  item: ArticleItem;
}

export function ScrapingResultDisplay({ item }: Props) {
  const [activeTab, setActiveTab] = useState<'basic' | 'internal-links' | 'outer-links' | 'headings' | 'json-ld' | 'all-json'>('basic');

  return (
    <div className="py-4">
      {/* タブナビゲーション */}
      <div className="flex flex-wrap border-b dark:border-gray-700 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'basic'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('basic')}
        >
          基本情報
        </button>
        {item.internalLinks && item.internalLinks.length > 0 && (
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'internal-links'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('internal-links')}
          >
            内部リンク
          </button>
        )}
        {item.outerLinks && item.outerLinks.length > 0 && (
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'outer-links'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('outer-links')}
          >
            外部リンク
          </button>
        )}
        {item.headings && item.headings.length > 0 && (
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'headings'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('headings')}
          >
            見出し構造
          </button>
        )}
        {item.jsonLd && item.jsonLd.length > 0 && (
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'json-ld'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('json-ld')}
          >
            構造化データ
          </button>
        )}
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'all-json'
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
          }`}
          onClick={() => setActiveTab('all-json')}
        >
          JSON
        </button>
      </div>

      {/* タブコンテンツ */}
      <div className="mt-4">
        {activeTab === 'basic' && <ScrapingResultBasicInfo item={item} />}
        
        {activeTab === 'internal-links' && item.internalLinks && item.internalLinks.length > 0 && (
          <ScrapingResultInternalLinks item={item} />
        )}
        
        {activeTab === 'outer-links' && item.outerLinks && item.outerLinks.length > 0 && (
          <ScrapingResultOuterLinks item={item} />
        )}
        
        {activeTab === 'headings' && item.headings && item.headings.length > 0 && (
          <ScrapingResultHeadings item={item} />
        )}
        
        {activeTab === 'json-ld' && item.jsonLd && item.jsonLd.length > 0 && (
          <ScrapingResultJsonLd item={item} />
        )}
        
        {activeTab === 'all-json' && (
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
        )}
      </div>
    </div>
  );
}
