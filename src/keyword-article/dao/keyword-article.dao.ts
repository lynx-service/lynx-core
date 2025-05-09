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
   * キーワードIDに紐づく関連付けを検索する
   * @param keywordId - キーワードID
   * @returns 見つかった KeywordArticle レコードの配列
   */
  async findByKeywordId(keywordId: number) {
    return this.prisma.keywordArticle.findMany({
      where: { keywordId },
      include: { article: true }, // 関連する記事情報も取得
    });
  }

  /**
   * 記事IDに紐づく関連付けを検索する
   * @param articleId - 記事ID
   * @returns 見つかった KeywordArticle レコード（関連キーワードの親子関係含む）の配列
   */
  async findByArticleId(articleId: number) {
    // 関連するキーワード情報とその親子関係を含めて取得
    return this.prisma.keywordArticle.findMany({
      where: { articleId },
      include: {
        keyword: {
          include: {
            parentKeyword: true, // 親キーワードを取得
            childKeywords: true, // 直接の子キーワードを取得
          },
        },
      },
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
