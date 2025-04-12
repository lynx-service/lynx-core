import React, { useState } from 'react';
import { Card, CardContent } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Input } from '~/components/ui/input';
import type { ArticleItem } from '~/types/article';

interface ScrapingResultsListProps {
  articles: ArticleItem[];
}

/**
 * スクレイピング結果リストコンポーネント
 * 取得した記事のリストを表示
 * モダンなデザインに改善
 */
export function ScrapingResultsList({ articles }: ScrapingResultsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-6 bg-gray-50 dark:bg-gray-800/30 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">データがありません</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
          スクレイピングを実行すると、ここに結果が表示されます。
        </p>
      </div>
    );
  }

  // 検索フィルター
  const filteredArticles = articles.filter(article => 
    article.metaTitle.toLowerCase().includes(searchTerm.toLowerCase()) || 
    article.articleUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* 検索フィールド */}
      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <Input
          type="search"
          placeholder="記事を検索..."
          className="pl-10 h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 結果カウンター */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          受信した記事データ
        </h3>
        <Badge variant="outline" className="text-xs font-normal">
          {filteredArticles.length}/{articles.length}件
        </Badge>
      </div>

      {/* 結果リスト */}
      {filteredArticles.length > 0 ? (
        <ul className="space-y-3 max-h-[calc(100vh-24rem)] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar">
          {filteredArticles.map((article, index) => (
            <li key={index} className="bg-white dark:bg-gray-800/60 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700">
              <a 
                href={article.articleUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800/90"
              >
                <div className="flex flex-col w-full overflow-hidden">
                  <div className="flex flex-wrap items-start justify-between w-full">
                    <h4 className="text-blue-600 dark:text-blue-400 font-medium line-clamp-2 hover:underline break-words min-w-0 max-w-full mr-2">
                      {article.metaTitle || article.articleUrl}
                    </h4>
                    <div className="flex flex-wrap gap-2 mt-1 sm:mt-0 flex-shrink-0">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                        </svg>
                        {article.internalLinks.length}
                      </Badge>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 whitespace-nowrap">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                        {article.outerLinks.length}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 break-words overflow-hidden text-ellipsis">
                    {article.metaDescription || article.articleUrl}
                  </p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">検索結果がありません</p>
        </div>
      )}

      {/* カスタムスクロールバーはTailwindのクラスで代用 */}
    </div>
  );
}
