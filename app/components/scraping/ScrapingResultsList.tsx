import React from 'react';
import { Card, CardContent } from '~/components/ui/card';
import type { ArticleItem } from '~/types/article';

interface ScrapingResultsListProps {
  articles: ArticleItem[];
}

/**
 * スクレイピング結果リストコンポーネント
 * 取得した記事のリストを表示
 */
export function ScrapingResultsList({ articles }: ScrapingResultsListProps) {
  if (articles.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">受信した記事データ ({articles.length}件)</h3>
        <ul className="space-y-2 max-h-96 overflow-y-auto text-sm">
          {articles.map((article, index) => (
            <li key={index} className="border-b pb-1">
              <a href={article.articleUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {article.metaTitle || article.articleUrl}
              </a>
              <span className="text-xs text-gray-500 ml-2">
                ({article.internalLinks.length}内部 / {article.outerLinks.length}外部リンク)
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
