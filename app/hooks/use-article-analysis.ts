import { useFetcher } from 'react-router';
import { useEffect } from 'react';
import type { ArticleItem } from '~/types/article';

export interface SeoAnalysisResult {
  overallScore: number;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  summary: string;
  error?: boolean;
  message?: string;
}

/**
 * 記事のSEO分析を行うためのフック
 * @param articleId 分析対象の記事ID（nullの場合は分析を行わない）
 */
export function useArticleAnalysis(articleId: string | null) {
  const fetcher = useFetcher<{ success: boolean; analysis: SeoAnalysisResult }>();
  
  useEffect(() => {
    if (articleId && fetcher.state === 'idle' && !fetcher.data) {
      fetcher.submit(
        { articleId },
        { method: 'post', action: '/internal-link-matrix' }
      );
    }
  }, [articleId, fetcher]);
  
  return {
    analysis: fetcher.data?.analysis,
    isLoading: fetcher.state !== 'idle',
    error: fetcher.data?.success === false ? fetcher.data?.analysis?.message : undefined
  };
}

/**
 * サイト全体のSEO分析結果の型
 */
export interface OverallSeoAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  summary: string;
  error?: boolean;
  message?: string;
}
