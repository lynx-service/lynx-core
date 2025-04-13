import { useFetcher } from 'react-router';
import { useCallback } from 'react';
import type { OverallSeoAnalysis } from './use-article-analysis'; // 型定義を再利用

/**
 * サイト全体のSEO分析を実行し、状態を管理するためのフック
 */
export function useOverallAnalysis() {
  // useFetcherの型定義を修正
  const fetcher = useFetcher<{ success: boolean; analysis: OverallSeoAnalysis }>();

  // 分析を実行する関数
  const runOverallAnalysis = useCallback(() => {
    // 既に実行中でなければ実行
    if (fetcher.state === 'idle') {
      // POSTリクエストを新しいリソースルートに送信
      // 送信するデータは不要（トリガーのみ）
      fetcher.submit(null, {
        method: 'post',
        action: '/analyze-overall.api', // 新しいリソースルートのパスに更新
      });
    }
  }, [fetcher]);

  // analysisResultを正しく取得するように修正
  const analysisResult = fetcher.data?.success ? fetcher.data.analysis : null;
  // エラーメッセージを正しく取得するように修正
  const error = fetcher.data?.success === false ? fetcher.data.analysis?.message : undefined;

  return {
    runAnalysis: runOverallAnalysis, // AiAnalysisSectionで使う関数名に合わせる
    analysisResult: analysisResult,
    isLoading: fetcher.state !== 'idle',
    error: error,
    hasData: fetcher.data !== undefined,
  };
}
