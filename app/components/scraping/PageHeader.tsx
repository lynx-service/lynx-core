import React from 'react';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import type { CrawlStatus } from '~/types/scraping';

interface PageHeaderProps {
  hasResults: boolean;
  crawlStatus: CrawlStatus;
  onViewResults: () => void;
}

/**
 * スクレイピングページのヘッダー部分
 * タイトル、説明、結果表示ボタンを含む
 */
export function PageHeader({ hasResults, crawlStatus, onViewResults }: PageHeaderProps) {
  // ステータスに応じたバッジを表示
  const renderStatusBadge = () => {
    if (crawlStatus === 'running') {
      return (
        <Badge className="bg-blue-500 text-white animate-pulse ml-2">
          処理中
        </Badge>
      );
    }
    if (crawlStatus === 'completed' && hasResults) {
      return (
        <Badge className="bg-emerald-500 text-white ml-2">
          完了
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="mb-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-extrabold sm:text-4xl inline-flex items-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
              サイト分析ツール
            </span>
            {renderStatusBadge()}
          </h1>
          <p className="mt-3 max-w-md text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-3">
            URLとクラス名を入力して、ウェブサイトの構造を分析します
          </p>
        </div>

        {/* 結果表示ボタン (完了時かつ結果がある場合のみ表示) */}
        {hasResults && (
          <div className="mt-5 md:mt-0 text-center md:text-right">
            <Button 
              onClick={onViewResults}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              詳細な分析結果を表示
            </Button>
          </div>
        )}
      </div>

      {/* 装飾的な区切り線 */}
      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background dark:bg-gray-900 px-3 text-sm text-gray-500 dark:text-gray-400">
            LYNX スクレイピングツール
          </span>
        </div>
      </div>
    </div>
  );
}
