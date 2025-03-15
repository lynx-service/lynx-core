import type { Route } from "./+types/home";
import { useLoaderData } from "react-router";
import { getSession } from "~/utils/session.server";
import { requireAuth } from "~/utils/auth.server";
import { useAtom } from "jotai";
import { scrapingResultsAtom } from "~/atoms/scrapingResults";
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
  const user = session.get("user");

  // TODO: API経由でデータを取得するように修正
  // const res = await fetch("http://localhost:3000/api/dashboard", {
  //   headers: {
  //     Authorization: `Bearer ${token}`,
  //   }
  // });
  // if (!res.ok) {
  //   throw new Response("Failed to fetch data", { status: res.status });
  // }
  // const data = await res.json();
  // return { data, user };

  return { user };
};

export default function Home() {
  const { user } = useLoaderData();
  const navigate = useNavigate();
  const [results] = useAtom(scrapingResultsAtom);

  // インデックス状態の集計
  const indexStatusCount = {
    index: results.filter(item => item.index_status === 'index').length,
    noindex: results.filter(item => item.index_status !== 'index').length,
  };

  // 内部リンク数の分布を計算
  const internalLinksDistribution = results.reduce((acc, item) => {
    const linkCount = item.internal_links?.length || 0;
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

        {/* 概要カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>総ページ数</CardTitle>
              <CardDescription>スクレイピングされた全ページ数</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {results.length}
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
