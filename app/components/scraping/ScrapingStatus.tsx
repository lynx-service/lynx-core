import React from 'react';
import type { CrawlStatus, ProgressInfo } from '~/types/scraping';

interface ScrapingStatusProps {
  crawlStatus: CrawlStatus;
  progressInfo: ProgressInfo | null;
  errorMessage: string | null;
}

/**
 * スクレイピングの状態表示コンポーネント
 * 進行状況、完了メッセージ、エラーメッセージを表示
 */
export function ScrapingStatus({ crawlStatus, progressInfo, errorMessage }: ScrapingStatusProps) {
  // 実行前のアイドル状態の表示
  const renderIdleStatus = () => (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center">
        <svg className="h-5 w-5 text-gray-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="text-gray-700 dark:text-gray-300 font-medium">
          実行待機中
        </p>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 pl-8">
        フォームを入力して「分析開始」ボタンを押してください。
      </p>
    </div>
  );

  // 進行状況表示
  const renderRunningStatus = () => (
    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
      <div className="flex items-center mb-2">
        <svg className="animate-spin h-5 w-5 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-blue-700 dark:text-blue-300 font-medium">
          スクレイピング処理中です...
        </p>
      </div>
      {progressInfo && (
        <div className="text-sm text-blue-600 dark:text-blue-400 pl-8">
          <p>{progressInfo.message}</p>
          <p>処理済みページ数: {progressInfo.processedPages}</p>
          <p>経過時間: {progressInfo.elapsedTime.toFixed(2)}秒</p>
        </div>
      )}
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 pl-8">
        このページを離れると処理が中断されます。
      </p>
    </div>
  );

  // 完了メッセージ
  const renderCompletedStatus = () => (
    <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
      <div className="flex items-center">
        <svg className="h-5 w-5 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <p className="text-green-700 dark:text-green-300 font-medium">
          スクレイピングが完了しました。
        </p>
      </div>
      {progressInfo && (
        <div className="text-sm text-green-600 dark:text-green-400 pl-8 mt-1">
          <p>総処理ページ数: {progressInfo.processedPages}</p>
          <p>総処理時間: {progressInfo.elapsedTime.toFixed(2)}秒</p>
        </div>
      )}
    </div>
  );

  // エラーメッセージ
  const renderErrorStatus = () => (
    errorMessage && (
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="text-red-700 dark:text-red-300 font-medium">
            エラーが発生しました:
          </p>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1 pl-8">{errorMessage}</p>
      </div>
    )
  );

  return (
    <div className="h-full flex flex-col justify-center"> {/* 高さを親要素に合わせ、中央寄せ */}
      {crawlStatus === 'idle' && renderIdleStatus()}
      {crawlStatus === 'running' && renderRunningStatus()}
      {crawlStatus === 'completed' && renderCompletedStatus()}
      {crawlStatus === 'error' && renderErrorStatus()}
    </div>
  );
}
