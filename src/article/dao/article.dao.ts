import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../share/prisma/prisma.service';
import { Article, InternalLink, OuterLink, Prisma } from '@prisma/client';
import { CreateArticleDetailDto } from '../dto/bulk-create-articles.dto';

/**
 * 記事作成・更新時の統計情報
 */
export interface ArticleCreationStats {
  articlesDeleted: number;
  articlesCreated: number;
  innerLinksCreated: number;
  outerLinksCreated: number;
  headingsCreated: number;
}

/**
 * リレーション含めた記事情報の型定義
 */
export interface ArticleWithRelations extends Article {
  internalLinks?: InternalLink[];
  outerLinks?: OuterLink[];
}

@Injectable()
export class ArticleDao {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * プロジェクトに紐づく既存の記事をすべて削除（関連するリンクも含む）
   * @param projectId プロジェクトID
   * @returns 削除された記事の数
   */
  async deleteArticlesByProjectId(projectId: number): Promise<number> {
    return this.prisma.$transaction(async (prisma) => {
      // 1. 既存の記事IDを取得
      const articlesToDelete = await prisma.article.findMany({
        where: { projectId },
        select: { id: true },
      });

      const articleIds = articlesToDelete.map((article) => article.id);

      if (articleIds.length === 0) {
        return 0;
      }

      // 2. 内部リンクを削除
      await prisma.internalLink.deleteMany({
        where: {
          criteriaArticleId: { in: articleIds },
        },
      });

      // 3. 外部リンクを削除
      await prisma.outerLink.deleteMany({
        where: {
          criteriaArticleId: { in: articleIds },
        },
      });

      // 4. 記事を削除
      const deleteResult = await prisma.article.deleteMany({
        where: {
          id: { in: articleIds },
        },
      });

      return deleteResult.count;
    });
  }

  /**
   * 記事を作成
   * @param projectId プロジェクトID
   * @param articleDto 記事作成DTO
   * @returns 作成された記事
   */
  async createArticle(
    projectId: number,
    articleDto: CreateArticleDetailDto,
  ): Promise<Article> {
    // JSONとしてシリアライズ
    const headingsJson = JSON.parse(JSON.stringify(articleDto.headings));
    const jsonLdJson = JSON.parse(JSON.stringify(articleDto.jsonLd));

    return this.prisma.article.create({
      data: {
        projectId,
        articleUrl: articleDto.articleUrl,
        metaTitle: articleDto.metaTitle,
        metaDescription: articleDto.metaDescription,
        isIndexable: articleDto.isIndexable,
        headings: headingsJson,
        jsonLd: jsonLdJson,
      },
    });
  }

  /**
   * 内部リンクを処理
   * @param criteriaArticleId 基準記事ID
   * @param internalLinks 内部リンク配列
   * @returns 作成された内部リンクの数
   */
  async processInternalLinks(
    criteriaArticleId: number,
    internalLinks: CreateArticleDetailDto['internalLinks'],
  ): Promise<number> {
    let created = 0;

    for (const link of internalLinks) {
      // JSONとしてシリアライズ
      const statusJson = JSON.parse(JSON.stringify(link.status));

      // 内部リンクを作成
      await this.prisma.internalLink.create({
        data: {
          criteriaArticleId,
          linkUrl: link.linkUrl,
          anchorText: link.anchorText || '',
          isFollow: link.isFollow,
          status: statusJson,
        },
      });
      created += 1;
    }

    return created;
  }

  /**
   * 外部リンクを処理
   * @param criteriaArticleId 基準記事ID
   * @param outerLinks 外部リンク配列
   * @returns 作成された外部リンクの数
   */
  async processOuterLinks(
    criteriaArticleId: number,
    outerLinks: CreateArticleDetailDto['outerLinks'],
  ): Promise<number> {
    let created = 0;

    for (const link of outerLinks) {
      // JSONとしてシリアライズ
      const statusJson = JSON.parse(JSON.stringify(link.status));

      // 外部リンクを作成
      await this.prisma.outerLink.create({
        data: {
          criteriaArticleId,
          linkUrl: link.linkUrl,
          anchorText: link.anchorText || '',
          isFollow: link.isFollow,
          status: statusJson,
        },
      });
      created += 1;
    }

    return created;
  }

  /**
   * プロジェクトIDに紐づく記事一覧（詳細情報を含む）を取得
   * @param projectId プロジェクトID
   * @returns 記事一覧（リレーション含む）
   */
  async findDetailedArticlesByProjectId(
    projectId: number,
  ): Promise<ArticleWithRelations[]> {
    return this.prisma.article.findMany({
      where: { projectId },
      include: {
        internalLinks: true,
        outerLinks: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
  }

  /**
   * 記事IDに紐づく記事単体（詳細情報を含む）を取得
   * @param id 記事ID
   * @returns 記事（リレーション含む） or null
   */
  async findDetailedArticleById(
    id: number,
  ): Promise<ArticleWithRelations | null> {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: {
        internalLinks: true,
        outerLinks: true,
      },
    });

    if (!article) {
      return null;
    }

    return article;
  }

  /**
   * 指定されたプロジェクトIDに紐づく記事一覧の最小限の情報を取得する
   * @param projectId プロジェクトID
   * @returns 記事一覧 (id, metaTitle, articleUrl, metaDescription のみ)
   */
  async findMinimalArticlesByProjectId(projectId: number): Promise<
    (Pick<Article, 'id' | 'metaTitle' | 'articleUrl' | 'metaDescription'> & {
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
        // 3階層まで取得する
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

  /**
   * プロジェクトIDに紐づく記事をページネーションで取得 (フィード形式)
   * @param projectId プロジェクトID
   * @param cursor カーソル (id_createdAt)
   * @param take 取得件数
   * @returns 記事の配列と次のカーソル
   */
  async findPaginatedByProjectId(
    projectId: number,
    cursor?: number,
    take?: number, // this 'take' is the number of items the usecase wants to fetch (e.g., limit + 1)
  ): Promise<ArticleWithRelations[]> {
    // ArticleResponseDto に合わせて internalLinks と outerLinks を取得
    const orderBy: Prisma.ArticleOrderByWithRelationInput[] = [
      { createdAt: 'desc' },
      { id: 'asc' }, // Stable sort for items with the same createdAt
    ];

    const findManyArgs: Prisma.ArticleFindManyArgs = {
      where: { projectId },
      orderBy,
      take: take ? Number(take) : undefined,
      include: {
        // ArticleResponseDto に合わせて内部リンクと外部リンクを含める
        internalLinks: true,
        outerLinks: true,
        // keywords は ArticleResponseDto には含まれないため、ここでは取得しない
      },
    };

    if (cursor !== undefined) { // cursor が undefined でないことを確認
      // カーソルが指定されている場合、skipを使用してページネーションを実現
      findManyArgs.cursor = {
        id: cursor,
      };
      findManyArgs.skip = 1; // Skip the cursor item itself
    }

    const articles = await this.prisma.article.findMany(findManyArgs);

    // The logic for determining `hasNextPage` and `nextCursor` will be in the Usecase,
    // which will fetch `take + 1` items.
    return articles as ArticleWithRelations[];
  }
}
