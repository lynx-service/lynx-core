import React from 'react';
import { Button } from '~/components/ui/button';
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
  return (
    <div className="text-center mb-10">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
          サイト分析ツール
        </span>
      </h1>
      <p className="mt-3 max-w-md mx-auto text-base text-gray-500 dark:text-gray-300 sm:text-lg md:mt-5 md:text-xl">
        URLとクラス名を入力して、ウェブサイトの構造を分析します
      </p>

      {/* 結果表示ボタン (完了時かつ結果がある場合のみ表示) */}
      {hasResults && (
        <div className="mt-5">
          <Button onClick={onViewResults}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            スクレイピング結果を表示する
          </Button>
        </div>
      )}
    </div>
  );
}
