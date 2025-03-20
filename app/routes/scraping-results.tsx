import type { Route } from "./+types/home";
import { useLoaderData, useNavigate } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { useAtom } from "jotai";
import { scrapingResultsAtom, type EditableScrapingResultItem, type SimpleScrapingResultItem } from "~/atoms/scrapingResults";
import { useState, useEffect } from "react";
import { ScrapingResultSimpleModal } from "~/components/scraping/ScrapingResultSimpleModal";
import { ScrapingResultSimpleList } from "~/components/scraping/ScrapingResultSimpleList";
import { saveAllResults, fetchResults } from "~/services/scraping-api.service";

// shadcn/uiコンポーネント
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { AlertTriangle, ArrowLeft, Save, FileText, Search } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "スクレイピング結果" },
    { name: "description", content: "スクレイピング結果の閲覧" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const refreshToken = session.get("refreshToken");
  const user = session.get("user");

  try {
    // バックエンドAPIからスクレイピング結果を取得
    const response = await fetch("http://localhost:3000/scraping", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const scrapingResults = await response.json();

    return { user, token, refreshToken, scrapingResults, error: null };
  } catch (error) {
    console.error("Failed to fetch scraping results:", error);
    return {
      user,
      token,
      refreshToken,
      scrapingResults: null,
      error: error instanceof Error ? error.message : "データの取得に失敗しました"
    };
  }
};

// EditableScrapingResultItemからSimpleScrapingResultItemへの変換関数
const convertToSimpleItem = (item: EditableScrapingResultItem): SimpleScrapingResultItem => {
  return {
    id: item.id,
    url: item.url,
    title: item.title,
    content: item.content,
    index_status: item.index_status,
    internal_links_count: Array.isArray(item.internal_links) ? item.internal_links.length : 0,
    headings_count: Array.isArray(item.headings) ? item.headings.length : 0
  };
};

export default function ScrapingResults() {
  const { user, token, refreshToken, scrapingResults, error } = useLoaderData<typeof loader>();
  const [results, setResults] = useAtom(scrapingResultsAtom);
  const navigate = useNavigate();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(error);
  const [simpleResults, setSimpleResults] = useState<SimpleScrapingResultItem[]>([]);

  // スクレイピング結果をバックエンドに保存する関数
  const saveAllResultsToBackend = async () => {
    if (!token || !user) {
      setApiError("認証情報が見つかりません");
      return;
    }

    setIsLoading(true);

    const { data, error } = await saveAllResults(token, user.id, results);

    if (error) {
      setApiError(error);
      setIsLoading(false);
      return;
    }

    // 保存後に最新データを取得
    const { data: refreshedData, error: refreshError } = await fetchResults(token);

    if (refreshError) {
      setApiError(refreshError);
      setIsLoading(false);
      return;
    }

    if (refreshedData && Array.isArray(refreshedData) && refreshedData.length > 0) {
      const editableResults = refreshedData.map(item => ({
        ...item,
        isEditing: false
      })) as EditableScrapingResultItem[];
      
      setResults(editableResults);
    }

    alert("スクレイピング結果を保存しました");
    setIsLoading(false);
  };

  // バックエンドから取得したデータをJotaiのatomに設定
  useEffect(() => {
    if (scrapingResults && Array.isArray(scrapingResults) && scrapingResults.length > 0) {
      // DBから取得したデータをEditableScrapingResultItem形式に変換
      const editableResults = scrapingResults.map(item => ({
        ...item,
        isEditing: false
      })) as EditableScrapingResultItem[];
      
      // DBから取得したデータを設定
      setResults(editableResults);
    }
  }, [scrapingResults, setResults]);

  // EditableScrapingResultItemからSimpleScrapingResultItemへの変換
  useEffect(() => {
    if (results.length > 0) {
      const simple = results.map(convertToSimpleItem);
      setSimpleResults(simple);
    } else {
      setSimpleResults([]);
    }
  }, [results]);

  // スクレイピング画面に戻る
  const handleBack = () => {
    navigate("/scrapying");
  };

  // 項目を選択
  const handleSelectItem = (id: string) => {
    setSelectedItemId(id);
    setIsDialogOpen(true);
  };

  // 選択されているアイテムを取得
  const selectedItem = simpleResults.find(item => item.id === selectedItemId);

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
                スクレイピング結果
              </span>
            </h1>
            <p className="text-muted-foreground">
              取得した{simpleResults.length}件のデータを閲覧・保存できます
            </p>
          </div>

          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            
            <Button
              onClick={saveAllResultsToBackend}
              disabled={isLoading || results.length === 0}
              className="flex items-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  結果を保存
                </>
              )}
            </Button>
          </div>
        </div>

        {/* エラー表示 */}
        {apiError && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>
              {apiError}
            </AlertDescription>
          </Alert>
        )}

        {/* 結果表示 */}
        {simpleResults.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">スクレイピング結果がありません</p>
              <Button 
                variant="outline" 
                onClick={handleBack} 
                className="mt-4"
              >
                <Search className="mr-2 h-4 w-4" />
                新しいスクレイピングを開始
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="grid" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grid" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  グリッド表示
                </TabsTrigger>
                <TabsTrigger value="table" className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  テーブル表示
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="grid" className="mt-0">
              <ScrapingResultSimpleList
                results={simpleResults}
                onSelectItem={handleSelectItem}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="table" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>タイトル</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>インデックス状態</TableHead>
                        <TableHead>内部リンク数</TableHead>
                        <TableHead className="w-[100px]">アクション</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {simpleResults.map(item => (
                        <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {item.title || "タイトルなし"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.url}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={item.index_status === "index" ? "default" : "destructive"}
                              className={item.index_status === "index" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
                            >
                              {item.index_status === "index" ? "インデックス" : "ノーインデックス"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.internal_links_count}</TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleSelectItem(item.id)}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">詳細</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {/* モーダル */}
        {selectedItem && (
          <ScrapingResultSimpleModal
            isOpen={isDialogOpen}
            setOpen={setIsDialogOpen}
            item={selectedItem}
          />
        )}
      </div>
    </div>
  );
}
