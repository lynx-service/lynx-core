import { Injectable, NotFoundException } from '@nestjs/common';
import { ScrapingResultDao } from '../../scraping/dao/scraping-result.dao'; // Article取得用Dao
import { KeywordArticleDao } from '../dao/keyword-article.dao';
import { Keyword } from '@prisma/client'; // Keyword 型をインポート

@Injectable()
export class ListKeywordsByArticleUsecase {
  constructor(
    private readonly scrapingResultDao: ScrapingResultDao,
    private readonly keywordArticleDao: KeywordArticleDao,
  ) {}

  /**
   * 指定された記事IDに紐づくキーワードの一覧を取得する
   * @param articleId - 記事ID
   * @throws NotFoundException - 記事が見つからない場合
   * @returns キーワード (Keyword) の配列
   */
  async execute(articleId: number): Promise<Keyword[]> {
    // 1. 記事の存在確認
    const article = await this.scrapingResultDao.findById(articleId);
    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found.`);
    }

    // 2. 記事IDに紐づく関連付けを取得 (関連するキーワード情報を含む)
    const keywordArticles = await this.keywordArticleDao.findByArticleId(
      articleId,
    );

    // 3. 関連付けからキーワード情報のみを抽出して返す
    // findByArticleId で include: { keyword: true } を指定しているため、
    // 各 keywordArticle オブジェクトには keyword プロパティが含まれる
    return keywordArticles.map((ka) => ka.keyword);
  }
}
