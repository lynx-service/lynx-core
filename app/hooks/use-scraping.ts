import { useState, useRef, useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { articlesAtom } from '~/atoms/article';
import { useToast } from '~/hooks/use-toast';
import type { ArticleItem } from '~/types/article';
import type { CrawlStatus, ProgressInfo, UseScrapingReturn } from '~/types/scraping';

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

  // コンポーネントがアンマウントされる際にクリーンアップ
  useEffect(() => {
    return resetState;
  }, [resetState]);

  // ストリーム処理関数
  const processStream = useCallback(async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = "";
    let currentArticles: ArticleItem[] = [];

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // ストリーム終了時に残っているバッファを処理
          if (buffer.trim()) {
            try {
              const json = JSON.parse(buffer.trim());
              // 最後のデータ処理
              if (json.type === 'completion') {
                setProgressInfo(prev => ({ ...prev, message: json.message, processedPages: json.processed_pages, elapsedTime: json.total_time }));
                setCrawlStatus('completed');
                setGlobalScrapingResults(currentArticles);
              } else if (!json.type && typeof json === 'object' && json !== null && 'articleUrl' in json) {
                currentArticles = [...currentArticles, json];
                setScrapedArticles(currentArticles);
              } else if (json.error) {
                 setErrorMessage(`スクレイピングエラー: ${json.error}`);
                 setCrawlStatus('error');
              }
            } catch (e) {
              console.error("Error parsing final JSON chunk:", e, buffer);
              setErrorMessage(`レスポンスの最終チャンク解析エラー: ${buffer}`);
              setCrawlStatus('error');
            }
          } else if (crawlStatus !== 'completed' && crawlStatus !== 'error') {
             console.warn("Stream ended unexpectedly without completion/error message.");
             setCrawlStatus('completed');
             setGlobalScrapingResults(currentArticles);
          }
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line.trim());

            // データタイプに応じてstateを更新
            if (json.type === 'status') {
              setProgressInfo({ message: json.message, processedPages: 0, elapsedTime: 0 });
            } else if (json.type === 'progress') {
              setProgressInfo({ message: json.message, processedPages: json.processed_pages, elapsedTime: json.elapsed_time });
            } else if (json.type === 'completion') {
              setProgressInfo(prev => ({ ...prev, message: json.message, processedPages: json.processed_pages, elapsedTime: json.total_time }));
              setCrawlStatus('completed');
              setGlobalScrapingResults(currentArticles);
              break;
            } else if (json.error) {
              setErrorMessage(`スクレイピングエラー: ${json.error}`);
              setCrawlStatus('error');
              break;
            } else if (!json.type && typeof json === 'object' && json !== null && 'articleUrl' in json) {
              currentArticles = [...currentArticles, json];
              setScrapedArticles(currentArticles);
            } else {
              console.warn("Unknown JSON structure received:", json);
            }
          } catch (e) {
            console.error("Error parsing JSON line:", e, line);
            setErrorMessage(`レスポンスの解析中にエラーが発生しました: ${line}`);
            setCrawlStatus('error');
            break;
          }
        }
        if (crawlStatus === 'completed' || crawlStatus === 'error') break;
      }
    } catch (error) {
      console.error("Error reading stream:", error);
      setErrorMessage(error instanceof Error ? error.message : "ストリームの読み取り中にエラーが発生しました");
      setCrawlStatus('error');
    } finally {
      reader.releaseLock();
      if (crawlStatus !== 'completed' && crawlStatus !== 'error') {
        setCrawlStatus('error');
        if (!errorMessage) {
          setErrorMessage("スクレイピング処理が予期せず終了しました。");
        }
      }
    }
  }, [setGlobalScrapingResults, crawlStatus, errorMessage]);

  // 中断処理関数
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
      const stopResponse = await fetch(`/api/crawl/stop/${jobId}`, {
        method: "POST",
      });

      const result = await stopResponse.json();

      if (stopResponse.ok) {
        console.log(`Stop signal sent successfully for job: ${jobId}`);
        if (!isNavigating) {
          toast({
            title: "中断リクエスト送信",
            description: result.message || `スクレイピングジョブ ${jobId} の中断リクエストを送信しました。`,
          });
        }
      } else {
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
      console.error(`Error sending stop signal for job: ${jobId}`, error);
      if (!isNavigating) {
        toast({
          title: "中断リクエストエラー",
          description: `ジョブ ${jobId} の中断リクエスト送信中にエラーが発生しました。`,
          variant: "destructive",
        });
      }
    } finally {
      // 中断時にもグローバルステートを更新
      setGlobalScrapingResults(scrapedArticles);
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
      const response = await fetch("/api/crawl/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "Authorization": `Bearer ${token}` }),
        },
        body: JSON.stringify({
          start_url: values.startUrl,
          target_class: values.targetClass
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorDetail = `APIエラー: ${response.status}`;
        try {
            const errorJson = JSON.parse(errorText);
            errorDetail = errorJson.detail || errorDetail;
        } catch {
            if (errorText) errorDetail += ` - ${errorText}`;
        }
        throw new Error(errorDetail);
      }

      // すべてのレスポンスヘッダーをログ出力
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
        
        setTimeout(() => {
          console.log("Current jobId state after update:", jobId);
        }, 100);
        
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
      await processStream(reader);

    } catch (err) {
       if (err instanceof Error && err.name === 'AbortError') {
        console.log("Fetch aborted.");
      } else {
        console.error("Scraping request failed:", err);
        setErrorMessage(err instanceof Error ? err.message : "スクレイピングリクエストの送信中にエラーが発生しました");
        setCrawlStatus('error');
      }
    } finally {
       abortControllerRef.current = null;
    }
  }, [token, processStream, setGlobalScrapingResults, toast, jobId]);

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
