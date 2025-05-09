import { Injectable } from '@nestjs/common';
import { CreateScrapingResultDto } from '../dto/create-scraping-result.dto';
import { ScrapingResult, ScrapingResultDao } from '../dao/scraping-result.dao';

@Injectable()
export class BulkCreateScrapingResultUsecase {
  constructor(private readonly scrapingResultDao: ScrapingResultDao) {}

  /**
   * スクレイピング結果を一括保存
   * @param createScrapingResultDto スクレイピング結果DTO
   * @returns 保存結果の統計情報
   */
  async execute(
    createScrapingResultDto: CreateScrapingResultDto,
  ): Promise<ScrapingResult> {
    const { projectId, articles } = createScrapingResultDto;

    // 1. プロジェクトに紐づく既存の記事をすべて削除
    const articlesDeleted =
      await this.scrapingResultDao.deleteArticlesByProjectId(projectId);

    // 2. 統計情報の初期化
    const stats: ScrapingResult = {
      articlesDeleted,
      articlesCreated: 0,
      innerLinksCreated: 0,
      outerLinksCreated: 0,
      headingsCreated: 0,
    };

    // 3. 各記事を処理
    for (const article of articles) {
      // 3.1. 記事を作成
      const createdArticle = await this.scrapingResultDao.createArticle(
        projectId,
        article,
      );
      stats.articlesCreated += 1;

      // 3.2. 内部リンクを処理
      if (article.internalLinks && article.internalLinks.length > 0) {
        const innerLinksCreated =
          await this.scrapingResultDao.processInternalLinks(
            createdArticle.id,
            article.internalLinks,
          );
        stats.innerLinksCreated += innerLinksCreated;
      }

      // 3.3. 外部リンクを処理
      if (article.outerLinks && article.outerLinks.length > 0) {
        const outerLinksCreated =
          await this.scrapingResultDao.processOuterLinks(
            createdArticle.id,
            article.outerLinks,
          );
        stats.outerLinksCreated += outerLinksCreated;
      }

      // 3.4. 見出しをカウント（JSONデータをカウントする）
      if (article.headings && article.headings.length > 0) {
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
        stats.headingsCreated += countHeadings(article.headings);
      }
    }

    return stats;
  }
}
