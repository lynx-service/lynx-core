import { Injectable, NotFoundException } from '@nestjs/common';
import { KeywordArticleDao } from '../dao/keyword-article.dao';

@Injectable()
export class UnlinkKeywordArticleUsecase {
  constructor(private readonly keywordArticleDao: KeywordArticleDao) {}

  /**
   * キーワードと記事の関連付けを解除する
   * @param keywordId - キーワードID
   * @param articleId - 記事ID
   * @throws NotFoundException - 関連付けが見つからない場合
   * @returns 削除された KeywordArticle レコード
   */
  async execute(keywordId: number, articleId: number) {
    // 1. 関連付けが存在するか確認
    const existingLink = await this.keywordArticleDao.findOne(
      keywordId,
      articleId,
    );
    if (!existingLink) {
      throw new NotFoundException(
        `Link between Keyword ${keywordId} and Article ${articleId} not found.`,
      );
    }

    // 2. 関連付けを削除
    return this.keywordArticleDao.delete(keywordId, articleId);
  }
}
