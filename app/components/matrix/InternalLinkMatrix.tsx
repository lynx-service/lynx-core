import React from 'react';
import type { ArticleItem } from '~/types/article';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from '~/lib/utils';

interface InternalLinkMatrixProps {
  articles: ArticleItem[];
  onCellClick: (targetArticle: ArticleItem) => void;
}

/**
 * 内部リンクのマトリクス表示コンポーネント
 * 行: リンク元記事 / 列: リンク先記事
 */
export default function InternalLinkMatrix({ articles, onCellClick }: InternalLinkMatrixProps): React.ReactNode {
  // 記事IDをキーとした記事データのマップを作成（検索効率化のため）
  const articleMap = new Map(articles.map(article => [article.id, article]));
  
  /**
   * リンクの有無に基づく色の設定
   * SEO観点での内部リンク可視化のため、リンクの有無を色で表現
   */
  const getLinkColor = (hasLink: boolean, isDark: boolean) => {
    if (!hasLink) return isDark ? 'bg-gray-800' : 'bg-gray-50';
    // リンクがある場合は緑色
    return isDark ? 'bg-emerald-700' : 'bg-emerald-200';
  };

  return (
    <TooltipProvider>
      <div className="overflow-x-auto relative"> {/* 横スクロール可能にする */}
        <Table className="min-w-full border"> {/* テーブル全体の最小幅とボーダー */}
          <TableHeader>
            <TableRow>
              {/* 左上の空セル */}
              <TableHead className="sticky left-0 top-0 z-20 bg-background border-r border-b w-40 min-w-[160px]"> {/* 固定 */}
                <div className="flex items-center justify-between">
                  <span>リンク元 ↓ / リンク先 →</span>
                  <span className="text-xs text-muted-foreground">({articles.length}件)</span>
                </div>
              </TableHead>
              {/* 列ヘッダー (リンク先記事) */}
              {articles.map((colArticle) => (
                <TableHead 
                  key={`col-${colArticle.id}`} 
                  className="border-b border-l min-w-[150px] text-center align-middle sticky top-0 z-10 bg-background"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap cursor-help">
                        {colArticle.metaTitle || `記事ID: ${colArticle.id}`}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-md">
                      <div className="space-y-1">
                        <p className="font-semibold">{colArticle.metaTitle}</p>
                        <p className="text-xs text-muted-foreground break-all">{colArticle.articleUrl}</p>
                        <div className="flex justify-between text-xs pt-1">
                          <span>被リンク: {colArticle.linkedFrom?.length || 0}</span>
                          <span>発リンク: {colArticle.internalLinks?.length || 0}</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* 行 (リンク元記事) */}
            {articles.map((rowArticle) => (
              <TableRow 
                key={`row-${rowArticle.id}`}
              >
                {/* 行ヘッダー (リンク元記事) */}
                <TableHead
                  scope="row"
                  className="sticky left-0 z-10 bg-background border-r font-medium w-40 min-w-[160px] align-middle"
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap cursor-help">
                        {rowArticle.metaTitle || `記事ID: ${rowArticle.id}`}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-md">
                      <div className="space-y-1">
                        <p className="font-semibold">{rowArticle.metaTitle}</p>
                        <p className="text-xs text-muted-foreground break-all">{rowArticle.articleUrl}</p>
                        <div className="flex justify-between text-xs pt-1">
                          <span>被リンク: {rowArticle.linkedFrom?.length || 0}</span>
                          <span>発リンク: {rowArticle.internalLinks?.length || 0}</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TableHead>
                
                {/* セル (リンク有無) */}
                {articles.map((colArticle) => {
                  // リンク元記事からリンク先記事へのリンクが存在するかチェック
                  // URLベースでの判定を行う（リンクURLと記事URLの比較）
                  const hasLink = rowArticle.internalLinks?.some(link => {
                    try {
                      // URLを正規化（プロトコル、ホスト、パスのみを比較）
                      const linkUrl = new URL(link.linkUrl);
                      const articleUrl = new URL(colArticle.articleUrl);
                      
                      const normalizedLinkUrl = `${linkUrl.origin}${linkUrl.pathname}`.replace(/\/$/, '');
                      const normalizedArticleUrl = `${articleUrl.origin}${articleUrl.pathname}`.replace(/\/$/, '');
                      
                      return normalizedLinkUrl === normalizedArticleUrl;
                    } catch (e) {
                      // URL解析エラーの場合は単純な文字列比較を試みる
                      return link.linkUrl === colArticle.articleUrl;
                    }
                  }) || false;
                  
                  // リンクの詳細情報（ツールチップ表示用）
                  const links = hasLink ? rowArticle.internalLinks?.filter(link => {
                    try {
                      const linkUrl = new URL(link.linkUrl);
                      const articleUrl = new URL(colArticle.articleUrl);
                      
                      const normalizedLinkUrl = `${linkUrl.origin}${linkUrl.pathname}`.replace(/\/$/, '');
                      const normalizedArticleUrl = `${articleUrl.origin}${articleUrl.pathname}`.replace(/\/$/, '');
                      
                      return normalizedLinkUrl === normalizedArticleUrl;
                    } catch (e) {
                      return link.linkUrl === colArticle.articleUrl;
                    }
                  }) : [];

                  // 自分自身へのリンクは通常表示しない（グレーアウトなど）
                  const isSelfLink = rowArticle.id === colArticle.id;

                  return (
                    <Tooltip key={`cell-${rowArticle.id}-${colArticle.id}`}>
                      <TooltipTrigger asChild>
                        <TableCell
                          className={cn(
                            "border border-l text-center p-0 h-12 w-12 cursor-pointer transition-colors duration-150",
                            isSelfLink ? "bg-gray-200 dark:bg-gray-700 cursor-not-allowed" : "",
                            !isSelfLink && hasLink ? `${getLinkColor(hasLink, false)} dark:${getLinkColor(hasLink, true)}` : "",
                            !isSelfLink && !hasLink ? "bg-gray-50 dark:bg-gray-800" : ""
                          )}
                          onClick={() => !isSelfLink && onCellClick(colArticle)}
                        >
                          {/* リンクの有無を表示（チェックマーク） */}
                          {hasLink && !isSelfLink && (
                            <span className="font-medium">✓</span>
                          )}
                        </TableCell>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-xs">
                        {isSelfLink ? (
                          <p>自分自身へのリンク</p>
                        ) : hasLink ? (
                          <div className="space-y-1">
                            <p><span className="font-semibold">{rowArticle.metaTitle}</span> から <span className="font-semibold">{colArticle.metaTitle}</span> へのリンクがあります</p>
                            {links && links.length > 0 && (
                              <ul className="text-xs list-disc list-inside">
                                {links.slice(0, 3).map((link, idx) => (
                                  <li key={idx} className="truncate">
                                    <span className="font-medium">{link.anchorText || "リンクテキストなし"}</span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                      ({link.linkUrl.replace(/^https?:\/\//, '').split('/')[0]})
                                    </span>
                                  </li>
                                ))}
                                {links.length > 3 && <li>他 {links.length - 3} 件...</li>}
                              </ul>
                            )}
                            <p className="text-xs text-muted-foreground pt-1">
                              クリックして詳細を表示
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p>リンクなし</p>
                            <p className="text-xs text-muted-foreground pt-1">
                              SEO観点では内部リンクの追加を検討すると良いでしょう
                            </p>
                          </div>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
