import { Injectable } from '@nestjs/common';
import { BulkCreateArticlesDto } from '../dto/bulk-create-articles.dto';
import { ArticleDao, ArticleCreationStats } from '../dao/article.dao';

@Injectable()
export class BulkCreateArticlesUsecase {
  constructor(private readonly articleDao: ArticleDao) {}

  /**
   * スクレイピング結果（記事情報）を一括保存
   * @param bulkCreateArticlesDto 記事一括作成DTO
   * @returns 保存結果の統計情報
   */
  async execute(
    bulkCreateArticlesDto: BulkCreateArticlesDto,
  ): Promise<ArticleCreationStats> {
    const { projectId, articles } = bulkCreateArticlesDto;

    // 1. プロジェクトに紐づく既存の記事をすべて削除
    const articlesDeleted =
      await this.articleDao.deleteArticlesByProjectId(projectId);

    // 2. 統計情報の初期化
    const stats: ArticleCreationStats = {
      articlesDeleted,
      articlesCreated: 0,
      innerLinksCreated: 0,
      outerLinksCreated: 0,
      headingsCreated: 0, // Articleモデル自体にはheadingsテーブルはないが、元ロジックに合わせてカウント
    };

    // 3. 各記事を処理
    for (const articleDto of articles) {
      // 3.1. 記事を作成
      const createdArticle = await this.articleDao.createArticle(
        projectId,
        articleDto,
      );
      stats.articlesCreated += 1;

      // 3.2. 内部リンクを処理
      if (articleDto.internalLinks && articleDto.internalLinks.length > 0) {
        const innerLinksCreated =
          await this.articleDao.processInternalLinks(
            createdArticle.id,
            articleDto.internalLinks,
          );
        stats.innerLinksCreated += innerLinksCreated;
      }

      // 3.3. 外部リンクを処理
      if (articleDto.outerLinks && articleDto.outerLinks.length > 0) {
        const outerLinksCreated =
          await this.articleDao.processOuterLinks(
            createdArticle.id,
            articleDto.outerLinks,
          );
        stats.outerLinksCreated += outerLinksCreated;
      }

      // 3.4. 見出しをカウント（JSONデータをカウントする）
      if (articleDto.headings && articleDto.headings.length > 0) {
        // 見出しの数をカウント（フラット化して数える）
        const countHeadings = (headings: any[]): number => {
          return headings.reduce((count, heading) => {
            return (
              count +
              1 +
              (heading.children ? countHeadings(heading.children) : 0)
            );
          }, 0);
        };
        stats.headingsCreated += countHeadings(articleDto.headings);
      }
    }

    return stats;
  }
}
