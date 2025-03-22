import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/share/prisma/prisma.service';
import { ArticleDto, HeadingDto } from '../dto/create-scraping-result.dto';
import { Prisma, Article } from '@prisma/client';

/**
 * スクレイピング結果の保存結果
 */
export interface ScrapingResult {
  articlesDeleted: number;
  articlesCreated: number;
  innerLinksCreated: number;
  headingsCreated: number;
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
      
      const articleIds = articlesToDelete.map(article => article.id);
      
      if (articleIds.length === 0) {
        return 0;
      }
      
      // 2. 内部リンクを削除
      await prisma.innerLink.deleteMany({
        where: {
          OR: [
            { criteriaArticleId: { in: articleIds } },
            { linkedArticleId: { in: articleIds } },
          ],
        },
      });
      
      // 3. 見出しを削除
      await prisma.heading.deleteMany({
        where: {
          articleId: { in: articleIds },
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
  async createArticle(projectId: number, article: ArticleDto): Promise<Article> {
    return this.prismaService.article.create({
      data: {
        projectId,
        articleUrl: article.articleUrl,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        isIndexable: article.isIndexable,
      },
    });
  }
  
  /**
   * 内部リンクを処理
   * @param criteriaArticleId 基準記事ID
   * @param projectId プロジェクトID
   * @param internalLinks 内部リンク配列
   * @returns 作成された内部リンクの数
   */
  async processInternalLinks(
    criteriaArticleId: number,
    projectId: number,
    internalLinks: ArticleDto['internalLinks'],
  ): Promise<number> {
    let created = 0;
    
    for (const link of internalLinks) {
      // リンク先の記事を検索または作成
      const linkedArticle = await this.findOrCreateLinkedArticle(
        projectId,
        link.linkUrl,
      );
      
      // 内部リンクを作成
      await this.prismaService.innerLink.create({
        data: {
          criteriaArticleId,
          linkedArticleId: linkedArticle.id,
          linkUrl: link.linkUrl,
          anchorText: link.anchorText || '',
          rel: link.rel || '',
          type: link.type,
          isActive: link.isActive,
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
        metaTitle: '', // 後で更新される可能性あり
        metaDescription: '',
        isIndexable: true,
      },
    });
  }
  
  /**
   * 見出しの階層構造を処理して保存
   * @param articleId 記事ID
   * @param headings 見出し配列
   * @param parentId 親見出しID
   * @param order 表示順序
   * @returns 作成された見出しの数
   */
  async processHeadings(
    articleId: number,
    headings: HeadingDto[],
    parentId: number = null,
    order: number = 0,
  ): Promise<number> {
    let created = 0;
    let currentOrder = order;
    
    for (const heading of headings) {
      // tagからlevelを抽出（例：h1 -> 1, h2 -> 2）
      const level = parseInt(heading.tag.substring(1));
      
      // 見出しを作成
      const createdHeading = await this.prismaService.heading.create({
        data: {
          articleId,
          tag: heading.tag,
          text: heading.text,
          level,
          parentId,
          order: currentOrder++,
        },
      });
      created += 1;
      
      // 子見出しを再帰的に処理
      if (heading.children && heading.children.length > 0) {
        created += await this.processHeadings(
          articleId,
          heading.children,
          createdHeading.id,
          currentOrder * 100, // 子要素の順序を親要素より大きくする
        );
      }
    }
    
    return created;
  }
  
  /**
   * プロジェクトIDに紐づく記事を取得
   * @param projectId プロジェクトID
   * @returns 記事一覧
   */
  async findByProjectId(projectId: number): Promise<Article[]> {
    return this.prismaService.article.findMany({
      where: { projectId },
      include: {
        headings: {
          orderBy: {
            order: 'asc',
          },
        },
        innerLinks: {
          include: {
            linkedArticle: true,
          },
        },
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
  async findById(id: number): Promise<Article> {
    return this.prismaService.article.findUnique({
      where: { id },
      include: {
        headings: {
          orderBy: {
            order: 'asc',
          },
        },
        innerLinks: {
          include: {
            linkedArticle: true,
          },
        },
      },
    });
  }
}
