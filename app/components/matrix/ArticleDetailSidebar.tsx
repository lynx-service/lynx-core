import React from 'react';
import type { ArticleItem, InternalLinkItem } from '~/types/article';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "~/components/ui/sheet";
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
// ScrollAreaコンポーネントが存在しないため、標準のオーバーフロースクロールを使用

/**
 * 内部リンクのバランス状態を評価し、適切な色を返す
 */
const getBalanceColor = (article: ArticleItem): string => {
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;
  
  // 発リンクと被リンクのバランスが良い場合は緑
  if (hasOutgoingLinks && hasIncomingLinks) {
    return "text-emerald-600";
  }
  // 発リンクのみある場合は黄色
  else if (hasOutgoingLinks && !hasIncomingLinks) {
    return "text-amber-600";
  }
  // 被リンクのみある場合も黄色
  else if (!hasOutgoingLinks && hasIncomingLinks) {
    return "text-amber-600";
  }
  // どちらもない場合は赤
  else {
    return "text-red-600";
  }
};

/**
 * 内部リンクの状態を評価し、適切なテキストを返す
 */
const getBalanceText = (article: ArticleItem): string => {
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;
  
  if (hasOutgoingLinks && hasIncomingLinks) {
    return "良好（発リンクと被リンクの両方があります）";
  }
  else if (hasOutgoingLinks && !hasIncomingLinks) {
    return "要改善（発リンクのみで被リンクがありません）";
  }
  else if (!hasOutgoingLinks && hasIncomingLinks) {
    return "要改善（被リンクのみで発リンクがありません）";
  }
  else {
    return "孤立（発リンクも被リンクもありません）";
  }
};

/**
 * 記事の孤立状態を評価し、適切な色を返す
 */
const getIsolationColor = (article: ArticleItem): string => {
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;
  
  if (!hasOutgoingLinks && !hasIncomingLinks) {
    return "text-red-600"; // 完全に孤立している場合は赤
  }
  else if (!hasOutgoingLinks || !hasIncomingLinks) {
    return "text-amber-600"; // 片方向のみリンクがある場合は黄色
  }
  else {
    return "text-emerald-600"; // 両方向にリンクがある場合は緑
  }
};

/**
 * 記事の孤立状態を評価し、適切なテキストを返す
 */
const getIsolationText = (article: ArticleItem): string => {
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;
  
  if (!hasOutgoingLinks && !hasIncomingLinks) {
    return "完全に孤立しています（SEO改善が必要）";
  }
  else if (!hasOutgoingLinks) {
    return "発リンクがありません（他の記事へのリンクを追加すると良いでしょう）";
  }
  else if (!hasIncomingLinks) {
    return "被リンクがありません（他の記事からリンクされていません）";
  }
  else {
    return "孤立していません（良好な状態です）";
  }
};

/**
 * SEO観点での改善提案を生成する
 */
const getSeoSuggestions = (article: ArticleItem): string[] => {
  const suggestions: string[] = [];
  const hasOutgoingLinks = (article.internalLinks?.length || 0) > 0;
  const hasIncomingLinks = (article.linkedFrom?.length || 0) > 0;
  
  // 内部リンクがない場合
  if (!hasOutgoingLinks) {
    suggestions.push("関連する他の記事へのリンクを追加することで、サイト内の回遊率向上が期待できます。");
  }
  
  // 被リンクがない場合
  if (!hasIncomingLinks) {
    suggestions.push("他の記事からこの記事へのリンクを増やすことで、この記事の重要性を検索エンジンにアピールできます。");
  }
  
  // リンク数が少ない場合
  const outgoingLinks = article.internalLinks?.length || 0;
  if (outgoingLinks > 0 && outgoingLinks < 3) {
    suggestions.push("内部リンク数が少ないため、関連コンテンツへのリンクをさらに追加すると良いでしょう。");
  }
  
  // nofollowリンクがある場合
  if (article.internalLinks?.some(link => !link.isFollow)) {
    suggestions.push("一部のリンクがnofollowになっています。内部リンクは基本的にfollowにすることをお勧めします。");
  }
  
  // 提案がない場合（良好な状態）
  if (suggestions.length === 0) {
    suggestions.push("内部リンク構造は良好です。現状を維持しましょう。");
  }
  
  return suggestions;
};

interface ArticleDetailSidebarProps {
  article: ArticleItem | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 記事詳細を表示するサイドバーコンポーネント
 * SEO観点での内部リンク分析情報も表示
 */
export default function ArticleDetailSidebar({ article, isOpen, onClose }: ArticleDetailSidebarProps) {
  if (!article) {
    return null; // 記事が選択されていない場合は何も表示しない
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col"> {/* 幅を調整し、flex-colを追加 */}
        <SheetHeader>
          <SheetTitle>記事詳細</SheetTitle>
          <SheetDescription>
            選択された記事の情報を表示します。
          </SheetDescription>
        </SheetHeader>
        {/* タブ付きコンテンツ */}
        <Tabs defaultValue="basic" className="flex-grow flex flex-col">
          <TabsList className="grid grid-cols-3 mb-2">
            <TabsTrigger value="basic">基本情報</TabsTrigger>
            <TabsTrigger value="links">内部リンク</TabsTrigger>
            <TabsTrigger value="seo">SEO分析</TabsTrigger>
          </TabsList>
          
          {/* 基本情報タブ */}
          <TabsContent value="basic" className="flex-grow overflow-y-auto pr-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-1">タイトル</h3>
                <p className="text-sm text-muted-foreground">{article.metaTitle}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">URL</h3>
                <a
                  href={article.articleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {article.articleUrl}
                </a>
              </div>
              <div>
                <h3 className="font-semibold mb-1">ディスクリプション</h3>
                <p className="text-sm text-muted-foreground">{article.metaDescription || '未設定'}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">見出し (H1)</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                  {article.headings?.filter(h => h.tag === 'h1').map((h, index) => (
                    <li key={`h1-${index}`}>{h.text}</li>
                  )) || <li>未設定</li>}
                </ul>
              </div>
              <div className="flex gap-4">
                <div>
                  <h3 className="font-semibold mb-1">発リンク</h3>
                  <div className="flex items-center">
                    <p className="text-sm text-muted-foreground">{article.internalLinks?.length ?? 0} 件</p>
                    {article.internalLinks && article.internalLinks.length > 0 ? (
                      <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                        リンクあり
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-500 border-gray-200">
                        リンクなし
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">被リンク</h3>
                  <div className="flex items-center">
                    <p className="text-sm text-muted-foreground">{article.linkedFrom?.length ?? 0} 件</p>
                    {article.linkedFrom && article.linkedFrom.length > 0 ? (
                      <Badge variant="outline" className="ml-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                        リンクあり
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="ml-2 bg-gray-50 text-gray-500 border-gray-200">
                        リンクなし
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* 内部リンクタブ */}
          <TabsContent value="links" className="flex-grow overflow-y-auto pr-4">
            <div className="space-y-6">
              {/* 発リンク（この記事から他の記事へのリンク） */}
              <div>
                <h3 className="font-semibold mb-2">発リンク（この記事から他の記事へのリンク）</h3>
                {article.internalLinks && article.internalLinks.length > 0 ? (
                  <ul className="space-y-3">
                    {article.internalLinks.map((link, index) => (
                      <li key={`outgoing-${index}`} className="border-b pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-sm">{link.anchorText || "リンクテキストなし"}</p>
                            <a 
                              href={link.linkUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline break-all"
                            >
                              {link.linkUrl}
                            </a>
                          </div>
                          <Badge variant={link.isFollow ? "default" : "outline"}>
                            {link.isFollow ? "follow" : "nofollow"}
                          </Badge>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">発リンクはありません</p>
                )}
              </div>
              
              {/* 被リンク（他の記事からこの記事へのリンク） */}
              <div>
                <h3 className="font-semibold mb-2">被リンク（他の記事からこの記事へのリンク）</h3>
                {article.linkedFrom && article.linkedFrom.length > 0 ? (
                  <ul className="space-y-3">
                    {article.linkedFrom.map((link, index) => {
                      // criteriaArticleIdから記事情報を取得（実際の実装ではAPIなどから取得）
                      const sourceArticleId = link.criteriaArticleId;
                      return (
                        <li key={`incoming-${index}`} className="border-b pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                記事ID: {sourceArticleId} からのリンク
                              </p>
                              <p className="text-xs text-muted-foreground">
                                アンカーテキスト: {link.anchorText || "リンクテキストなし"}
                              </p>
                            </div>
                            <Badge variant={link.isFollow ? "default" : "outline"}>
                              {link.isFollow ? "follow" : "nofollow"}
                            </Badge>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">被リンクはありません</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* SEO分析タブ */}
          <TabsContent value="seo" className="flex-grow overflow-y-auto pr-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">内部リンク分析</h3>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="space-y-2">
                    {/* 内部リンクの状態に基づいた分析情報 */}
                    <li className="text-sm">
                      <span className="font-medium">内部リンク状態: </span>
                      <span className={`${getBalanceColor(article)}`}>
                        {getBalanceText(article)}
                      </span>
                    </li>
                    <li className="text-sm">
                      <span className="font-medium">孤立状態: </span>
                      <span className={`${getIsolationColor(article)}`}>
                        {getIsolationText(article)}
                      </span>
                    </li>
                    <li className="text-sm">
                      <span className="font-medium">リンク品質: </span>
                      {article.internalLinks?.some(link => !link.isFollow) ? (
                        <span className="text-amber-600">一部nofollowリンクがあります</span>
                      ) : (
                        <span className="text-emerald-600">すべてfollowリンクです</span>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">改善提案</h3>
                <div className="bg-muted p-3 rounded-md">
                  <ul className="space-y-2 text-sm list-disc list-inside">
                    {getSeoSuggestions(article).map((suggestion, index) => (
                      <li key={`suggestion-${index}`}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <SheetFooter className="mt-auto pt-4 border-t"> {/* フッターを下に固定 */}
          <SheetClose asChild>
            <Button variant="outline">閉じる</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
