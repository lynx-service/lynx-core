import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../share/prisma/prisma.service';
import { Article } from '@prisma/client';

@Injectable()
export class ArticleDao {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 指定されたプロジェクトIDに紐づく記事の最小限の情報を取得する
   * @param projectId プロジェクトID
   * @returns 記事の配列 (id, metaTitle, articleUrl, metaDescription のみ)
   */
  async findMinimalArticlesByProjectId(
    projectId: number,
  ): Promise<
    (Pick<
      Article,
      'id' | 'metaTitle' | 'articleUrl' | 'metaDescription'
    > & {
      keywords: { keyword: { id: number; keywordName: string } }[];
    })[]
  > {
    return this.prisma.article.findMany({
      where: {
        projectId: projectId,
      },
      select: {
        id: true,
        metaTitle: true,
        articleUrl: true,
        metaDescription: true,
        keywords: {
          // KeywordArticleの中間テーブルを経由してKeywordを取得
          select: {
            keyword: {
              // KeywordArticleからKeywordモデルを選択
              select: {
                id: true,
                keywordName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * 指定されたIDの記事を取得する (Usecaseでの存在確認用など)
   * @param articleId 記事ID
   * @returns 記事 or null
   */
  async findById(articleId: number): Promise<Article | null> {
    return this.prisma.article.findUnique({
      where: { id: articleId },
    });
  }
}
