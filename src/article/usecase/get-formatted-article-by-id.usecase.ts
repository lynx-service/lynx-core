import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleDao } from '../dao/article.dao';
import { ArticleResponseDto } from '../dto/article-response.dto';

@Injectable()
export class GetFormattedArticleByIdUsecase {
  constructor(private readonly articleDao: ArticleDao) {}

  /**
   * 記事IDに紐づく記事を取得し、フロントエンド用のフォーマットに変換
   * @param id 記事ID
   * @returns フロントエンド用の記事データ
   * @throws NotFoundException 記事が見つからない場合
   */
  async execute(id: number): Promise<ArticleResponseDto | null> {
    const article = await this.articleDao.findDetailedArticleById(id);

    if (!article) {
      throw new NotFoundException(`Article with ID ${id} not found`);
    }

    // フロントエンド用のフォーマットに変換
    return {
      id: article.id,
      projectId: article.projectId,
      articleUrl: article.articleUrl,
      metaTitle: article.metaTitle || '',
      metaDescription: article.metaDescription || '',
      isIndexable: article.isIndexable,
      internalLinks: article.internalLinks
        ? article.internalLinks.map((link) => ({
            linkUrl: link.linkUrl,
            anchorText: link.anchorText || '',
            isFollow: link.isFollow,
            status: link.status as any,
          }))
        : [],
      outerLinks: article.outerLinks
        ? article.outerLinks.map((link) => ({
            linkUrl: link.linkUrl,
            anchorText: link.anchorText || '',
            isFollow: link.isFollow,
            status: link.status as any,
          }))
        : [],
      headings: (article.headings as any) || [],
      jsonLd: (article.jsonLd as any) || [],
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}
