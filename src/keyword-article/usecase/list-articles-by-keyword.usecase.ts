import { Injectable, NotFoundException } from '@nestjs/common';
import { KeywordDao } from '../../keyword/dao/keyword.dao';
import { KeywordArticleDao } from '../dao/keyword-article.dao';
import { Article } from '@prisma/client'; // Article 型をインポート

@Injectable()
export class ListArticlesByKeywordUsecase {
  constructor(
    private readonly keywordDao: KeywordDao,
    private readonly keywordArticleDao: KeywordArticleDao,
  ) {}

  /**
   * 指定されたキーワードIDに紐づく記事の一覧を取得する
   * @param keywordId - キーワードID
   * @throws NotFoundException - キーワードが見つからない場合
   * @returns 記事 (Article) の配列
   */
  async execute(keywordId: number): Promise<Article[]> {
    // 1. キーワードの存在確認
    const keyword = await this.keywordDao.findById(keywordId);
    if (!keyword) {
      throw new NotFoundException(`Keyword with ID ${keywordId} not found.`);
    }

    // 2. キーワードIDに紐づく関連付けを取得 (関連する記事情報を含む)
    const keywordArticles = await this.keywordArticleDao.findByKeywordId(
      keywordId,
    );

    // 3. 関連付けから記事情報のみを抽出して返す
    // findByKeywordId で include: { article: true } を指定しているため、
    // 各 keywordArticle オブジェクトには article プロパティが含まれる
    return keywordArticles.map((ka) => ka.article);
  }
}
