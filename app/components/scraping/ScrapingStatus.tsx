import React from 'react';
import type { CrawlStatus, ProgressInfo } from '~/types/scraping';
import { Badge } from '~/components/ui/badge';

interface ScrapingStatusProps {
  crawlStatus: CrawlStatus;
  progressInfo: ProgressInfo | null;
  errorMessage: string | null;
}

/**
 * スクレイピングの状態表示コンポーネント
 * 進行状況、完了メッセージ、エラーメッセージを表示
 * モダンなデザインに改善
 */
export function ScrapingStatus({ crawlStatus, progressInfo, errorMessage }: ScrapingStatusProps) {
  // ステータスに応じたバッジの表示
  const renderStatusBadge = () => {
    switch (crawlStatus) {
      case 'idle':
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">待機中</Badge>;
      case 'running':
        return <Badge className="bg-blue-500 text-white animate-pulse">処理中</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-500 text-white">完了</Badge>;
      case 'error':
        return <Badge variant="destructive">エラー</Badge>;
      default:
        return null;
    }
  };

  // 実行前のアイドル状態の表示
  const renderIdleStatus = () => (
    <div className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">スクレイピングステータス</h3>
        {renderStatusBadge()}
      </div>
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-gray-100 dark:bg-gray-700 p-3 rounded-full">
          <svg className="h-6 w-6 text-gray-500 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-gray-700 dark:text-gray-300 font-medium">
            実行待機中
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            フォームを入力して「サイト分析を開始する」ボタンを押してください。
          </p>
        </div>
      </div>
    </div>
  );

  // 進行状況表示
  const renderRunningStatus = () => (
    <div className="p-6 bg-white dark:bg-gray-800 border-l-4 border-l-blue-500 border-t border-r border-b border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">スクレイピングステータス</h3>
        {renderStatusBadge()}
      </div>
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
          <svg className="animate-spin h-6 w-6 text-blue-500 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <div className="ml-4 flex-grow">
          <p className="text-blue-700 dark:text-blue-300 font-medium">
            スクレイピング処理中です...
          </p>
          {progressInfo && (
            <div className="mt-2">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>{progressInfo.message}</p>
                <div className="flex justify-between items-center mt-1">
                  <span>処理済みページ数: {progressInfo.processedPages}</span>
                  <span>経過時間: {progressInfo.elapsedTime.toFixed(2)}秒</span>
                </div>
              </div>
              {/* プログレスバー（仮の進捗表示） */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                <div className="bg-blue-500 dark:bg-blue-400 h-2.5 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 flex items-center">
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            このページを離れると処理が中断されます
          </p>
        </div>
      </div>
    </div>
  );

  // 完了メッセージ
  const renderCompletedStatus = () => (
    <div className="p-6 bg-white dark:bg-gray-800 border-l-4 border-l-emerald-500 border-t border-r border-b border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">スクレイピングステータス</h3>
        {renderStatusBadge()}
      </div>
      <div className="flex items-start">
        <div className="flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
          <svg className="h-6 w-6 text-emerald-500 dark:text-emerald-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-4">
          <p className="text-emerald-700 dark:text-emerald-300 font-medium">
            スクレイピングが完了しました
          </p>
          {progressInfo && (
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">総処理ページ数</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{progressInfo.processedPages}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400">総処理時間</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{progressInfo.elapsedTime.toFixed(2)}秒</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // エラーメッセージ
  const renderErrorStatus = () => (
    errorMessage && (
      <div className="p-6 bg-white dark:bg-gray-800 border-l-4 border-l-red-500 border-t border-r border-b border-gray-200 dark:border-gray-700 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">スクレイピングステータス</h3>
          {renderStatusBadge()}
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0 bg-red-100 dark:bg-red-900/30 p-3 rounded-full">
            <svg className="h-6 w-6 text-red-500 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-red-700 dark:text-red-300 font-medium">
              エラーが発生しました
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errorMessage}</p>
          </div>
        </div>
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
