import { Injectable } from '@nestjs/common';
import { ScrapingResultDao } from '../dao/scraping-result.dao';
import { FormattedArticle } from 'src/share/types/FormattedArticle';

@Injectable()
export class ListScrapingResultsUsecase {
  constructor(private readonly scrapingResultDao: ScrapingResultDao) {}

  /**
   * プロジェクトIDに紐づく記事一覧を取得し、フロントエンド用のフォーマットに変換
   * @param projectId プロジェクトID
   * @returns フロントエンド用の記事データ一覧
   */
  async execute(projectId: number): Promise<FormattedArticle[]> {
    const articles = await this.scrapingResultDao.findByProjectId(projectId);

    // TODO：返却値の型をもっとちゃんとする

    // 詳細情報を含む完全な記事データを返す
    return articles.map((article) => ({
      id: article.id,
      projectId: article.projectId,
      articleUrl: article.articleUrl,
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      isIndexable: article.isIndexable,
      internalLinks: article.internalLinks.map((link) => ({
        linkUrl: link.linkUrl,
        anchorText: link.anchorText || '',
        isFollow: link.isFollow,
        status: link.status as any,
      })),
      outerLinks: article.outerLinks.map((link) => ({
        linkUrl: link.linkUrl,
        anchorText: link.anchorText || '',
        isFollow: link.isFollow,
        status: link.status as any,
      })),
      headings: (article.headings as any) || [],
      jsonLd: (article.jsonLd as any) || [],
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    }));
  }
}
