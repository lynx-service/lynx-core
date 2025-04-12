import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { BarChart, PieChart, Link2, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import type { ArticleItem } from '~/types/article';
import type { OverallSeoAnalysis } from '~/hooks/use-article-analysis';

interface MatrixStatsProps {
  articles: ArticleItem[];
  seoAnalysis?: OverallSeoAnalysis | null;
}

/**
 * 内部リンクの統計情報を表示するコンポーネント
 * SEO観点での内部リンク状態の概要を提供
 */
export default function MatrixStats({ articles, seoAnalysis }: MatrixStatsProps) {
  // 孤立記事（発リンクも被リンクもない）の数
  const isolatedCount = articles.filter(article => 
    (article.internalLinks?.length || 0) === 0 && 
    (article.linkedFrom?.length || 0) === 0
  ).length;

  // 発リンクがない記事の数
  const noOutgoingCount = articles.filter(article => 
    (article.internalLinks?.length || 0) === 0
  ).length;

  // 被リンクがない記事の数
  const noIncomingCount = articles.filter(article => 
    (article.linkedFrom?.length || 0) === 0
  ).length;

  // リンク密度（全記事数に対する内部リンク数の比率）
  const totalLinks = articles.reduce((sum, article) => 
    sum + (article.internalLinks?.length || 0), 0
  );
  const linkDensity = articles.length > 0 
    ? (totalLinks / articles.length).toFixed(1) 
    : '0';

  // 健全な記事（発リンクと被リンクの両方がある）の数
  const healthyCount = articles.filter(article => 
    (article.internalLinks?.length || 0) > 0 && 
    (article.linkedFrom?.length || 0) > 0
  ).length;

  // 健全率（全記事数に対する健全な記事の割合）
  const healthRate = articles.length > 0 
    ? Math.round((healthyCount / articles.length) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6 pb-2">
      {/* AI SEO分析 */}
      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            AI SEO分析
          </CardTitle>
          <CardDescription>Gemini AIによる分析</CardDescription>
        </CardHeader>
        <CardContent>
          {seoAnalysis ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm">総合評価</p>
                <div className="flex items-center">
                  <span className="text-xl font-bold mr-1">{seoAnalysis.overallScore}</span>
                  <span className="text-xs text-muted-foreground">/10</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{seoAnalysis.summary}</p>
              {seoAnalysis.recommendations && seoAnalysis.recommendations.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs font-medium mb-1">おすすめの改善点:</p>
                  <ul className="text-xs list-disc list-inside space-y-1">
                    {seoAnalysis.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx} className="text-muted-foreground">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </CardContent>
      </Card>
      {/* 総記事数と内部リンク密度 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <BarChart className="h-4 w-4 mr-2 text-primary" />
            内部リンク概要
          </CardTitle>
          <CardDescription>リンク密度と記事数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{linkDensity}</p>
              <p className="text-xs text-muted-foreground">記事あたりの平均リンク数</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{articles.length}</p>
              <p className="text-xs text-muted-foreground">総記事数</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 健全な記事の割合 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <PieChart className="h-4 w-4 mr-2 text-primary" />
            リンク健全率
          </CardTitle>
          <CardDescription>発リンク・被リンク両方あり</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-2xl font-bold">{healthRate}%</p>
              <p className="text-xs text-muted-foreground">健全率</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{healthyCount}</p>
              <p className="text-xs text-muted-foreground">健全な記事数</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 発リンク・被リンクなし */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center">
            <Link2 className="h-4 w-4 mr-2 text-primary" />
            リンク不足記事
          </CardTitle>
          <CardDescription>発リンク・被リンクなし</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm">発リンクなし</p>
              <Badge variant="secondary">{noOutgoingCount}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm">被リンクなし</p>
              <Badge variant="secondary">{noIncomingCount}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 孤立記事 */}
      <Card className={isolatedCount > 0 ? "border-red-200 dark:border-red-900" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className={`text-base flex items-center ${isolatedCount > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
            <AlertTriangle className={`h-4 w-4 mr-2 ${isolatedCount > 0 ? "text-red-600 dark:text-red-400" : "text-primary"}`} />
            孤立記事
          </CardTitle>
          <CardDescription>発リンク・被リンク両方なし</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <div>
              <p className={`text-2xl font-bold ${isolatedCount > 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                {isolatedCount}
              </p>
              <p className="text-xs text-muted-foreground">孤立記事数</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {articles.length > 0 ? Math.round((isolatedCount / articles.length) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground">孤立率</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
