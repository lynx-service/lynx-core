import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { KeywordDao } from '../../keyword/dao/keyword.dao';
// ScrapingModule から Article を取得する Dao をインポート
import { ScrapingResultDao } from '../../scraping/dao/scraping-result.dao';
import { KeywordArticleDao } from '../dao/keyword-article.dao';

@Injectable()
export class LinkKeywordArticleUsecase {
  constructor(
    private readonly keywordDao: KeywordDao,
    private readonly scrapingResultDao: ScrapingResultDao, // 正しい Dao を注入
    private readonly keywordArticleDao: KeywordArticleDao,
  ) {}

  /**
   * キーワードと記事を関連付ける
   * @param keywordId - キーワードID
   * @param articleId - 記事ID
   * @throws NotFoundException - キーワードまたは記事が見つからない場合
   * @throws ConflictException - 既に関連付けが存在する場合
   * @returns 作成された KeywordArticle レコード
   */
  async execute(keywordId: number, articleId: number) {
    // 1. キーワードの存在確認
    const keyword = await this.keywordDao.findById(keywordId); // findById に修正
    if (!keyword) {
      throw new NotFoundException(`Keyword with ID ${keywordId} not found.`);
    }

    // 2. 記事の存在確認
    const article = await this.scrapingResultDao.findById(articleId); // scrapingResultDao.findById を使用
    if (!article) {
      throw new NotFoundException(`Article with ID ${articleId} not found.`);
    }

    // 3. 既に関連付けが存在しないか確認
    const existingLink = await this.keywordArticleDao.findOne(
      keywordId,
      articleId,
    );
    if (existingLink) {
      throw new ConflictException(
        `Link between Keyword ${keywordId} and Article ${articleId} already exists.`,
      );
    }

    // 4. 関連付けを作成
    return this.keywordArticleDao.create({
      keyword: { connect: { id: keywordId } },
      article: { connect: { id: articleId } },
    });
  }
}
