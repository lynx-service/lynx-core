import React, { useMemo } from 'react';
import type { ArticleItem } from '~/types/article';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { cn } from '~/lib/utils';
import { AlertTriangle, Check } from 'lucide-react';

interface InternalLinkMatrixProps {
  articles: ArticleItem[];
  onCellClick: (targetArticle: ArticleItem) => void;
}

/**
 * 内部リンクのマトリクス表示コンポーネント
 * 行: リンク元記事 / 列: リンク先記事
 */
export default function InternalLinkMatrix({ articles, onCellClick }: InternalLinkMatrixProps): React.ReactNode {
  // 孤立記事（発リンクも被リンクもない）のIDセットを作成
  const isolatedArticleIds = useMemo(() => {
    return new Set(
      articles
        .filter(article =>
          (article.internalLinks?.length || 0) === 0 &&
          (article.linkedFrom?.length || 0) === 0
        )
        .map(article => article.id)
    );
  }, [articles]);

  /**
   * リンクの有無に基づく色の設定
   * SEO観点での内部リンク可視化のため、リンクの有無を色で表現
   */
  const getCellStyle = (hasLink: boolean, isSelfLink: boolean, isIsolatedArticle: boolean) => {
    // 自分自身へのリンクの場合
    if (isSelfLink) {
      return "bg-gray-200 dark:bg-gray-700";
    }

    // 孤立記事の場合は特別なスタイルを適用
    if (isIsolatedArticle) {
      return hasLink
        ? "bg-emerald-100 dark:bg-emerald-900 border-red-300 dark:border-red-800 cursor-pointer"
        : "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800 cursor-pointer";
    }

    // 通常のリンク有無による色分け（ホバー効果なし）
    if (hasLink) {
      return "bg-emerald-100 dark:bg-emerald-900 cursor-pointer";
    } else {
      return "bg-gray-50 dark:bg-gray-800 cursor-pointer";
    }
  };

  return (
      <div className="overflow-x-auto relative w-full" style={{ scrollbarWidth: 'thin' }}>
        <Table className="border w-max"> {/* w-max を使用して内容に合わせた幅を確保 */}
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
                  title={`${colArticle.metaTitle}\n記事URL: ${colArticle.articleUrl}\n被リンク: ${colArticle.linkedFrom?.length || 0}\n発リンク: ${colArticle.internalLinks?.length || 0}`}
                >
                  <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {colArticle.metaTitle || `記事ID: ${colArticle.id}`}
                  </div>
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
                  title={`${rowArticle.metaTitle}\n記事URL: ${rowArticle.articleUrl}\n被リンク: ${rowArticle.linkedFrom?.length || 0}\n発リンク: ${rowArticle.internalLinks?.length || 0}`}
                >
                  <div className="max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {rowArticle.metaTitle || `記事ID: ${rowArticle.id}`}
                  </div>
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
                    <TableCell
                      key={`cell-${rowArticle.id}-${colArticle.id}`}
                      className={cn(
                        "border border-l text-center p-0 h-12 w-12",
                        getCellStyle(
                          hasLink,
                          isSelfLink,
                          isolatedArticleIds.has(rowArticle.id) || isolatedArticleIds.has(colArticle.id)
                        )
                      )}
                      onClick={() => !isSelfLink && onCellClick(colArticle)}
                      title={isSelfLink 
                        ? "自分自身へのリンク" 
                        : `${rowArticle.metaTitle || `記事ID: ${rowArticle.id}`} → ${colArticle.metaTitle || `記事ID: ${colArticle.id}`} (${hasLink ? 'リンクあり' : 'リンクなし'})`
                      }
                    >
                      {/* リンクの有無を表示（アイコン） */}
                      {hasLink && !isSelfLink && (
                        <Check className="h-4 w-4 mx-auto text-emerald-600 dark:text-emerald-400" />
                      )}

                      {/* 孤立記事の場合は警告アイコンを表示 */}
                      {!hasLink && !isSelfLink && isolatedArticleIds.has(rowArticle.id) && isolatedArticleIds.has(colArticle.id) && (
                        <AlertTriangle className="h-4 w-4 mx-auto text-red-500 dark:text-red-400 opacity-50" />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
  );
}
