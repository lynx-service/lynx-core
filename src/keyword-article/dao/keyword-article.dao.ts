import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../share/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class KeywordArticleDao {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * キーワードと記事の関連付けを作成する
   * @param data - 作成データ (keywordId, articleId)
   * @returns 作成された KeywordArticle レコード
   */
  async create(data: Prisma.KeywordArticleCreateInput) {
    return this.prisma.keywordArticle.create({ data });
  }

  /**
   * キーワードIDと記事IDで関連付けを検索する
   * @param keywordId - キーワードID
   * @param articleId - 記事ID
   * @returns 見つかった KeywordArticle レコード、または null
   */
  async findOne(keywordId: number, articleId: number) {
    return this.prisma.keywordArticle.findUnique({
      where: { keywordId_articleId: { keywordId, articleId } },
    });
  }

  /**
   * キーワードIDと記事IDで関連付けを削除する
   * @param keywordId - キーワードID
   * @param articleId - 記事ID
   * @returns 削除された KeywordArticle レコード
   */
  async delete(keywordId: number, articleId: number) {
    return this.prisma.keywordArticle.delete({
      where: { keywordId_articleId: { keywordId, articleId } },
    });
  }
}
