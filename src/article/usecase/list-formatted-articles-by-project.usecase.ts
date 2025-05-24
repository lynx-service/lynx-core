import { Injectable } from '@nestjs/common';
import { ArticleDao } from '../dao/article.dao';
import { ArticleResponseDto } from '../dto/article-response.dto';

@Injectable()
export class ListFormattedArticlesByProjectUsecase {
  constructor(private readonly articleDao: ArticleDao) {}

  /**
   * プロジェクトIDに紐づく記事一覧を取得し、フロントエンド用のフォーマットに変換
   * @param projectId プロジェクトID
   * @returns フロントエンド用の記事データ一覧
   */
  async execute(projectId: number): Promise<ArticleResponseDto[]> {
    const articles =
      await this.articleDao.findDetailedArticlesByProjectId(projectId);

    // フロントエンド用のフォーマットに変換
    return articles.map((article) => ({
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
    }));
  }
}
