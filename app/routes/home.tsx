import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import { Skeleton } from "~/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { ClientOnly } from "~/components/ui/client-only";
import { useState } from "react";
import { 
  BarChart2, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon, 
  AlertTriangle, 
  Info, 
  RefreshCw,
  ExternalLink,
  Search,
  Settings
} from "lucide-react";

// DBから取得するデータの型定義
interface ScrapingArticle {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  articleUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isIndexable: boolean | null;
}

interface InnerLink {
  linkedArticle: ScrapingArticle;
  linkUrl: string;
}

interface Heading {
  tag: string;
  text: string;
  children: Heading[];
}

interface ScrapingResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  articleUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isIndexable: boolean | null;
  innerLinks: InnerLink[];
  headings: Heading[];
}

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ダッシュボード - Lynx" },
    { name: "description", content: "サイト内のコンテンツの状態を確認できます" },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  // ログインチェック
  await requireAuth(request);

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const user = session.get("user");

  try {
    const res = await fetch("http://localhost:3000/scraping", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    const data = await res.json();
    return { data, user, error: null };
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return { 
      data: [], 
      user, 
      error: error instanceof Error ? error.message : "データの取得に失敗しました" 
    };
  }
};

export default function Home() {
  const { data, user, error } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("all");
  
  // DBから取得したデータを使用
  const scrapingResults = data as ScrapingResult[];

  // インデックス状態の集計
  const indexStatusCount = {
    index: scrapingResults.filter(item => item.isIndexable === true).length,
    noindex: scrapingResults.filter(item => item.isIndexable !== true).length,
  };

  // インデックス率の計算
  const indexRatio = scrapingResults.length > 0 
    ? Math.round((indexStatusCount.index / scrapingResults.length) * 100) 
    : 0;

  // 内部リンク数の分布を計算
  const internalLinksDistribution = scrapingResults.reduce((acc, item) => {
    const linkCount = item.innerLinks?.length || 0;
    const range = Math.floor(linkCount / 5) * 5; // 5リンクごとに区切る
    const key = `${range}-${range + 4}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(internalLinksDistribution).map(([range, count]) => ({
    range,
    count,
  }));

  // 見出しタグの分布を計算
  const headingDistribution = scrapingResults.reduce((acc, item) => {
    const countHeadingsByTag = (headings: Heading[], counts: Record<string, number>) => {
      headings.forEach(heading => {
        counts[heading.tag] = (counts[heading.tag] || 0) + 1;
        if (heading.children && heading.children.length > 0) {
          countHeadingsByTag(heading.children, counts);
        }
      });
      return counts;
    };
    
    return countHeadingsByTag(item.headings || [], acc);
  }, {} as Record<string, number>);

  const headingChartData = Object.entries(headingDistribution).map(([tag, count]) => ({
    tag,
    count,
  })).sort((a, b) => {
    // h1, h2, h3... の順にソート
    const tagA = parseInt(a.tag.replace('h', ''));
    const tagB = parseInt(b.tag.replace('h', ''));
    return tagA - tagB;
  });

  // 円グラフ用のカラー
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // データ更新のシミュレーション
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
                ダッシュボード
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              サイト内のコンテンツの状態を確認できます
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="期間を選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全期間</SelectItem>
                <SelectItem value="week">過去7日間</SelectItem>
                <SelectItem value="month">過去30日間</SelectItem>
                <SelectItem value="year">過去1年間</SelectItem>
              </SelectContent>
            </Select>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handleRefresh}
                    disabled={isLoading}
                  >
                    <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>データを更新</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Button
              onClick={() => navigate("/scrapying")}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Search className="mr-2 h-4 w-4" />
              新規スクレイピング
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラーが発生しました</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* タブナビゲーション */}
        <Tabs defaultValue="overview" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 md:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center">
              <BarChart2 className="mr-2 h-4 w-4" />
              <span>概要</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center">
              <PieChartIcon className="mr-2 h-4 w-4" />
              <span>コンテンツ</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center">
              <LineChartIcon className="mr-2 h-4 w-4" />
              <span>トレンド</span>
            </TabsTrigger>
          </TabsList>

          {/* 概要タブ */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPIカード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">総ページ数</CardTitle>
                  <CardDescription>スクレイピングされた全ページ数</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-14 w-20" />
                  ) : (
                    <div className="flex items-end space-x-2">
                      <p className="text-4xl font-bold text-foreground">
                        {scrapingResults.length}
                      </p>
                      <Badge variant="outline" className="mb-1">
                        ページ
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">インデックス状態</CardTitle>
                  <CardDescription>インデックス可能なページの割合</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-14 w-20" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-end space-x-2">
                        <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                          {indexRatio}%
                        </p>
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 mb-1">
                          {indexStatusCount.index} / {scrapingResults.length}
                        </Badge>
                      </div>
                      <Progress value={indexRatio} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">非インデックスページ</CardTitle>
                  <CardDescription>インデックスされないページ数</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <Skeleton className="h-14 w-20" />
                  ) : (
                    <div className="flex items-end space-x-2">
                      <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                        {indexStatusCount.noindex}
                      </p>
                      <Badge variant="destructive" className="mb-1">
                        要対応
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* 内部リンク分布グラフ */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>内部リンク数の分布</CardTitle>
                    <CardDescription>ページごとの内部リンク数の分布を表示</CardDescription>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>各ページが持つ内部リンクの数を5リンク単位で集計しています</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ClientOnly>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" />
                          <YAxis />
                          <RechartsTooltip />
                          <Bar dataKey="count" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ClientOnly>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* コンテンツタブ */}
          <TabsContent value="content" className="space-y-6">
            {/* 見出しタグ分布 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>見出しタグの分布</CardTitle>
                    <CardDescription>ページ内で使用されている見出しタグの分布</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <ClientOnly>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={headingChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            label={({ tag, count }) => `${tag}: ${count}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                          >
                            {headingChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </ClientOnly>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* トレンドタブ */}
          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>コンテンツ更新トレンド</CardTitle>
                <CardDescription>時間経過によるコンテンツの更新状況</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-[300px]">
                  <p className="text-muted-foreground">トレンドデータは現在準備中です</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* ユーザー情報 */}
        <Card>
          <CardHeader>
            <CardTitle>ユーザー情報</CardTitle>
            <CardDescription>現在ログイン中のユーザー</CardDescription>
          </CardHeader>
          <CardContent>
            {user && (
              <div className="space-y-2">
                <p className="text-foreground">
                  <span className="font-medium">ID：</span>
                  {user.id}
                </p>
                <p className="text-foreground">
                  <span className="font-medium">メールアドレス：</span>
                  {user.email}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              アカウント設定
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
