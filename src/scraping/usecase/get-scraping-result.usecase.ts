import { Injectable } from '@nestjs/common';
import { ScrapingResultDao } from '../dao/scraping-result.dao';
import { FormattedArticle } from 'src/share/types/FormattedArticle';

@Injectable()
export class GetScrapingResultUsecase {
  constructor(private readonly scrapingResultDao: ScrapingResultDao) {}

  /**
   * 記事IDに紐づく記事を取得し、フロントエンド用のフォーマットに変換
   * @param id 記事ID
   * @returns フロントエンド用の記事データ
   */
  async execute(id: number): Promise<FormattedArticle | null> {
    const article = await this.scrapingResultDao.findById(id);
    
    // Prismaの型からフロントエンド用の型に変換
    return {
      id: article.id,
      projectId: article.projectId,
      articleUrl: article.articleUrl,
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      isIndexable: article.isIndexable,
      internalLinks: article.internalLinks.map(link => ({
        linkUrl: link.linkUrl,
        anchorText: link.anchorText || '',
        isFollow: link.isFollow,
        status: link.status as any,
      })),
      outerLinks: article.outerLinks.map(link => ({
        linkUrl: link.linkUrl,
        anchorText: link.anchorText || '',
        isFollow: link.isFollow,
        status: link.status as any,
      })),
      headings: article.headings as any || [],
      jsonLd: article.jsonLd as any || [],
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  }
}
