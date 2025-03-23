import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/share/prisma/prisma.service';
import { ArticleDto, HeadingDto } from '../dto/create-scraping-result.dto';
import { Prisma, Article, InternalLink, OuterLink } from '@prisma/client';

/**
 * スクレイピング結果の保存結果
 */
export interface ScrapingResult {
  articlesDeleted: number;
  articlesCreated: number;
  innerLinksCreated: number;
  outerLinksCreated: number;
  headingsCreated: number;
}

/**
 * リレーション含めた記事情報の型定義
 */
export interface ArticleRelations extends Article {
  internalLinks?: InternalLink[];
  outerLinks?: OuterLink[];
}

@Injectable()
export class ScrapingResultDao {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * プロジェクトに紐づく既存の記事をすべて削除
   * @param projectId プロジェクトID
   * @returns 削除された記事の数
   */
  async deleteArticlesByProjectId(projectId: number): Promise<number> {
    return this.prismaService.$transaction(async (prisma) => {
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
   * @param article 記事DTO
   * @returns 作成された記事
   */
  async createArticle(
    projectId: number,
    article: ArticleDto,
  ): Promise<Article> {
    // JSONとしてシリアライズ
    const headingsJson = JSON.parse(JSON.stringify(article.headings));
    const jsonLdJson = JSON.parse(JSON.stringify(article.jsonLd));

    return this.prismaService.article.create({
      data: {
        projectId,
        articleUrl: article.articleUrl,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        isIndexable: article.isIndexable,
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
    internalLinks: ArticleDto['internalLinks'],
  ): Promise<number> {
    let created = 0;

    for (const link of internalLinks) {
      // JSONとしてシリアライズ
      const statusJson = JSON.parse(JSON.stringify(link.status));

      // 内部リンクを作成
      await this.prismaService.internalLink.create({
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
   * リンク先の記事を検索または作成
   * @param projectId プロジェクトID
   * @param linkUrl リンクURL
   * @returns リンク先の記事
   */
  async findOrCreateLinkedArticle(
    projectId: number,
    linkUrl: string,
  ): Promise<Article> {
    const linkedArticle = await this.prismaService.article.findFirst({
      where: {
        projectId,
        articleUrl: linkUrl,
      },
    });

    if (linkedArticle) {
      return linkedArticle;
    }

    // リンク先の記事が存在しない場合は作成
    return this.prismaService.article.create({
      data: {
        projectId,
        articleUrl: linkUrl,
        metaTitle: '',
        metaDescription: '',
        isIndexable: true,
      },
    });
  }

  /**
   * 外部リンクを処理
   * @param criteriaArticleId 基準記事ID
   * @param outerLinks 外部リンク配列
   * @returns 作成された外部リンクの数
   */
  async processOuterLinks(
    criteriaArticleId: number,
    outerLinks: ArticleDto['outerLinks'],
  ): Promise<number> {
    let created = 0;

    for (const link of outerLinks) {
      // JSONとしてシリアライズ
      const statusJson = JSON.parse(JSON.stringify(link.status));

      // 外部リンクを作成
      await this.prismaService.outerLink.create({
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
   * プロジェクトIDに紐づく記事を取得
   * @param projectId プロジェクトID
   * @returns 記事一覧
   */
  async findByProjectId(projectId: number): Promise<ArticleRelations[]> {
    return this.prismaService.article.findMany({
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
   * 記事IDに紐づく記事を取得
   * @param id 記事ID
   * @returns 記事
   */
  async findById(id: number): Promise<ArticleRelations | null> {
    const article = this.prismaService.article.findUnique({
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

  // /**
  //  * プロジェクトIDに紐づく記事を取得し、フロントエンド用のフォーマットに変換
  //  * @param projectId プロジェクトID
  //  * @returns フロントエンド用の記事データ
  //  */
  // async findAll(projectId: number): Promise<Article[]> {
  //   const articles = await this.prismaService.article.findMany({
  //     where: {
  //       projectId,
  //     },
  //     include: {
  //       internalLinks: true,
  //       outerLinks: true,
  //     },
  //   });

  //   if (!articles) {
  //     return [];
  //   }

  //   articles.map((article) => {
  //     // フロントエンド用のフォーマットに変換
  //     return {
  //       id: article.id,
  //       articleUrl: article.articleUrl,
  //       metaTitle: article.metaTitle,
  //       metaDescription: article.metaDescription,
  //       isIndexable: article.isIndexable,

  //       // 内部リンクを変換
  //       internalLinks: article.internalLinks.map((link) => ({
  //         linkUrl: link.linkUrl,
  //         anchorText: link.anchorText,
  //         isFollow: link.isFollow,
  //         status: link.status,
  //       })),

  //       // 外部リンクを変換
  //       outerLinks: article.outerLinks.map((link) => ({
  //         linkUrl: link.linkUrl,
  //         anchorText: link.anchorText,
  //         isFollow: link.isFollow,
  //         status: link.status,
  //       })),

  //       // 見出しと JSON-LD はJSONBカラムから直接取得
  //       headings: article.headings || [],
  //       jsonLd: article.jsonLd || [],
  //     };
  //   });
  // }

  // /**
  //  * 記事IDに紐づく記事を取得し、フロントエンド用のフォーマットに変換
  //  * @param id 記事ID
  //  * @returns フロントエンド用の記事データ
  //  */
  // async findByIdForFrontend(id: number): Promise<Article | null> {
  //   const article = await this.prismaService.article.findUnique({
  //     where: { id },
  //     include: {
  //       internalLinks: true,
  //       outerLinks: true,
  //     },
  //   });

  //   if (!article) {
  //     return null;
  //   }

  //   // フロントエンド用のフォーマットに変換
  //   return {
  //     id: article.id,
  //     articleUrl: article.articleUrl,
  //     metaTitle: article.metaTitle,
  //     metaDescription: article.metaDescription,
  //     isIndexable: article.isIndexable,

  //     // 内部リンクを変換
  //     internalLinks: article.internalLinks.map((link) => ({
  //       linkUrl: link.linkUrl,
  //       anchorText: link.anchorText,
  //       isFollow: link.isFollow,
  //       status: link.status,
  //     })),

  //     // 外部リンクを変換
  //     outerLinks: article.outerLinks.map((link) => ({
  //       linkUrl: link.linkUrl,
  //       anchorText: link.anchorText,
  //       isFollow: link.isFollow,
  //       status: link.status,
  //     })),

  //     // 見出しと JSON-LD はJSONBカラムから直接取得
  //     headings: article.headings || [],
  //     jsonLd: article.jsonLd || [],
  //   };
  // }
}
