import { useState, useRef, useCallback } from 'react'; // useEffectを削除 (現時点では不要)
import { useAtom } from 'jotai';
import { articlesAtom } from '~/atoms/article';
import { useToast } from '~/hooks/use-toast';
import type { ArticleItem } from '~/types/article';
import type { CrawlStatus, ProgressInfo, UseScrapingReturn } from '~/types/scraping';
// APIクライアント関数をインポート
import { startScrapingApi, cancelScrapingApi } from '~/services/scraping.client';
// ストリーム処理ユーティリティをインポート
import { processScrapingStream } from '~/utils/stream-processor.client';

export function useScraping(token?: string): UseScrapingReturn {
  // スクレイピングの状態管理
  const [crawlStatus, setCrawlStatus] = useState<CrawlStatus>('idle');
  const [progressInfo, setProgressInfo] = useState<ProgressInfo | null>(null);
  const [scrapedArticles, setScrapedArticles] = useState<ArticleItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [, setGlobalScrapingResults] = useAtom(articlesAtom);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // 状態をリセットする関数
  const resetState = useCallback(() => {
    console.log("Resetting scraping state...");
    setCrawlStatus('idle');
    setProgressInfo(null);
    setScrapedArticles([]);
    setErrorMessage(null);
    setJobId(null);
    setGlobalScrapingResults([]);
    
    // AbortControllerがあれば中断
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, [setGlobalScrapingResults]);

  // 中断処理関数 (変更なし)
  const cancelScraping = useCallback(async (isNavigating = false) => {
    if (!jobId) {
      console.warn("Cannot cancel scraping: Job ID is not set.");
      setCrawlStatus('idle');
      setJobId(null);
      setProgressInfo(null);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        console.log("Fetch aborted by frontend.");
      }
      // 中断時にもグローバルステートを更新
      setGlobalScrapingResults(scrapedArticles);
      if (!isNavigating) {
        toast({
          title: "中断処理",
          description: "スクレイピング処理を中断しました（ジョブID不明）。",
          variant: "destructive",
        });
      }
      return;
    }

    console.log(`Attempting to cancel job: ${jobId}`);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      console.log("Fetch aborted by frontend.");
    }

    try {
      // APIクライアント関数を呼び出す
      const stopResponse = await cancelScrapingApi({ jobId });
      const result = await stopResponse.json(); // レスポンスボディは常に読み取る

      if (stopResponse.ok) {
        console.log(`Stop signal sent successfully for job: ${jobId}`);
        if (!isNavigating) {
          toast({
            title: "中断リクエスト送信",
            description: result.message || `スクレイピングジョブ ${jobId} の中断リクエストを送信しました。`,
          });
        }
      } else {
        // APIクライアント側で warn ログは出力済み
        console.error(`Failed to send stop signal for job: ${jobId}`, result);
        if (!isNavigating) {
          toast({
            title: "中断リクエスト失敗",
            description: result.detail || `ジョブ ${jobId} の中断に失敗しました。`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      // cancelScrapingApi は通常 fetch レベルのエラーをスローしない想定だが念のため
      console.error(`Error calling cancelScrapingApi for job: ${jobId}`, error);
      if (!isNavigating) {
        toast({
          title: "中断リクエストエラー",
          description: `ジョブ ${jobId} の中断リクエスト送信中に予期せぬエラーが発生しました。`,
          variant: "destructive",
        });
      }
    } finally {
      // 中断時の状態リセットは常に実行
      setGlobalScrapingResults(scrapedArticles); // 中断時点の結果を保存
      setCrawlStatus('idle');
      setJobId(null);
      setProgressInfo(null);
    }
  }, [jobId, toast, scrapedArticles, setGlobalScrapingResults]);

  // フォーム送信時の処理 (fetchとストリーム処理を開始)
  const startScraping = useCallback(async (values: { startUrl: string; targetClass: string }) => {
    // 状態をリセット
    setCrawlStatus('running');
    setProgressInfo(null);
    setScrapedArticles([]);
    setErrorMessage(null);
    setJobId(null);
    setGlobalScrapingResults([]);
    abortControllerRef.current = new AbortController();

    try {
      // APIクライアント関数を呼び出す
      const response = await startScrapingApi({
        startUrl: values.startUrl,
        targetClass: values.targetClass,
        token,
        signal: abortControllerRef.current.signal,
      });

      // APIクライアントがエラーをスローするので、ここでの !response.ok チェックは不要

      // レスポンスヘッダーから Job ID を取得
      const allHeaders = [...response.headers.entries()];
      console.log("All response headers:", allHeaders);
      
      let foundJobId = null;
      for (const [key, value] of allHeaders) {
        if (key.toLowerCase() === 'x-job-id') {
          foundJobId = value;
          break;
        }
      }
      
      const currentJobId = foundJobId || response.headers.get("x-job-id") || response.headers.get("X-Job-ID");
      
      if (currentJobId) {
        console.log("Received Job ID:", currentJobId);
        setJobId(currentJobId);
        // Job ID 取得ロジックは変更なし
        toast({
          title: "スクレイピング開始",
          description: `ジョブID: ${currentJobId}`,
        });
      } else {
        console.warn("X-Job-ID header not found in response.");
        toast({
          title: "警告",
          description: "ジョブIDが取得できませんでした。中断機能が使用できません。",
          variant: "destructive",
        });
      }

      if (!response.body) {
        throw new Error("レスポンスボディがありません");
      }

      const reader = response.body.getReader();

      // ストリーム処理ユーティリティを呼び出すためのコールバックを定義
      let accumulatedArticles: ArticleItem[] = [];
      await processScrapingStream(reader, {
        onStatus: (message) => {
          setProgressInfo({ message, processedPages: 0, elapsedTime: 0 });
        },
        onProgress: (progress) => {
          setProgressInfo(progress);
        },
        onData: (article) => {
          // データを蓄積し、ローカルステートを更新
          accumulatedArticles = [...accumulatedArticles, article];
          setScrapedArticles(accumulatedArticles);
        },
        onCompletion: (completionInfo) => {
          setProgressInfo(prev => ({ ...prev, ...completionInfo }));
          setGlobalScrapingResults(accumulatedArticles); // 完了時にグローバルステートを更新
          console.log('Jotai state updated on completion:', accumulatedArticles);
          setCrawlStatus('completed');
        },
        onError: (errorMsg) => {
          setErrorMessage(errorMsg);
          setGlobalScrapingResults(accumulatedArticles); // エラー時もそれまでの結果を保存
          setCrawlStatus('error');
        },
        onStreamEnd: () => {
          // 予期せぬ終了の場合 (completion/errorなし)
          setGlobalScrapingResults(accumulatedArticles);
          console.log('Jotai state updated on unexpected stream end:', accumulatedArticles);
          setCrawlStatus('completed'); // 暫定的に完了扱いとする
        }
      });

    } catch (err) {
       if (err instanceof Error && err.name === 'AbortError') {
        console.log("Fetch aborted.");
      } else {
        console.error("Scraping request failed:", err);
        setErrorMessage(err instanceof Error ? err.message : "スクレイピングリクエストの送信中にエラーが発生しました");
        setCrawlStatus('error');
      }
    } finally {
       abortControllerRef.current = null; // AbortControllerの参照をクリア
    }
  }, [token, setGlobalScrapingResults, toast]); // processStream を依存配列から削除

  return {
    crawlStatus,
    progressInfo,
    errorMessage,
    scrapedArticles,
    jobId,
    startScraping,
    cancelScraping
  };
}
