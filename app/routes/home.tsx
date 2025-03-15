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
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useNavigate } from "react-router";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  
  // DBから取得したデータを使用
  const scrapingResults = data as ScrapingResult[];

  // インデックス状態の集計
  const indexStatusCount = {
    index: scrapingResults.filter(item => item.isIndexable === true).length,
    noindex: scrapingResults.filter(item => item.isIndexable !== true).length,
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-blue-500">
                ダッシュボード
              </span>
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              サイト内のコンテンツの状態を確認できます
            </p>
          </div>

          <Button
            onClick={() => navigate("/scrapying")}
            className="mt-4 md:mt-0 bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-all duration-200"
          >
            新規スクレイピング
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">エラーが発生しました</h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 概要カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>総ページ数</CardTitle>
              <CardDescription>スクレイピングされた全ページ数</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {scrapingResults.length}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>インデックスページ</CardTitle>
              <CardDescription>インデックス可能なページ数</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {indexStatusCount.index}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>非インデックスページ</CardTitle>
              <CardDescription>インデックスされないページ数</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                {indexStatusCount.noindex}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 内部リンク分布グラフ */}
        <Card>
          <CardHeader>
            <CardTitle>内部リンク数の分布</CardTitle>
            <CardDescription>ページごとの内部リンク数の分布を表示</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* ユーザー情報 */}
        <Card>
          <CardHeader>
            <CardTitle>ユーザー情報</CardTitle>
            <CardDescription>現在ログイン中のユーザー</CardDescription>
          </CardHeader>
          <CardContent>
            {user && (
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">ID：</span>
                  {user.id}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">メールアドレス：</span>
                  {user.email}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
