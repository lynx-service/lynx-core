import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/share/prisma/prisma.service';
import { CreateScrapingResultDto, HeadingItem } from '../dto/create-scraping-result.dto';

@Injectable()
export class ScrapingResultDao {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * スクレイピング結果を保存
   * @param createScrapingResultDto 
   * @returns 
   */
  async create(createScrapingResultDto: CreateScrapingResultDto) {
    const { userId, scrapyingResultItems } = createScrapingResultDto;

    // ユーザーからワークスペースとプロジェクトを取得
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        workspace: {
          include: {
            projects: true
          }
        }
      }
    });

    if (!user || !user.workspaceId || user.workspace.projects.length === 0) {
      throw new Error('ユーザーにワークスペースまたはプロジェクトが関連付けられていません');
    }

    // 最初のプロジェクトを使用
    const projectId = user.workspace.projects[0].id;

    // トランザクションを使用して複数の操作を一括で実行
    return this.prismaService.$transaction(async (prisma) => {
      // 記事を一括作成
      const articles = await prisma.article.createMany({
        data: scrapyingResultItems.map(item => ({
          projectId,
          articleUrl: item.url,
          metaTitle: item.title,
          metaDescription: item.content,
          isIndexable: item.index_status === 'index'
        })),
        skipDuplicates: true, // URL重複の場合はスキップ
      });

      // 作成した記事を取得
      const createdArticles = await prisma.article.findMany({
        where: {
          projectId,
          articleUrl: {
            in: scrapyingResultItems.map(item => item.url)
          }
        }
      });

      // 記事とURLのマッピングを作成
      const articleUrlMap = new Map();
      createdArticles.forEach(article => {
        articleUrlMap.set(article.articleUrl, article.id);
      });

      // 内部リンクを処理
      const innerLinks = [];
      for (const item of scrapyingResultItems) {
        const criteriaArticleId = articleUrlMap.get(item.url);
        if (criteriaArticleId) {
          // 内部リンクを作成
          for (const linkUrl of item.internal_links) {
            const linkedArticleId = articleUrlMap.get(linkUrl);
            if (linkedArticleId) {
              innerLinks.push({
                type: 'text',
                criteriaArticleId,
                linkedArticleId,
                linkUrl,
                anchorText: '', // スクレイピングデータにアンカーテキストがない場合は空文字
              });
            }
          }
        }
      }

      // 内部リンクを一括作成
      if (innerLinks.length > 0) {
        await prisma.innerLink.createMany({
          data: innerLinks,
          skipDuplicates: true,
        });
      }

      // 見出しを処理
      let headingsCreated = 0;
      for (const item of scrapyingResultItems) {
        const articleId = articleUrlMap.get(item.url);
        if (articleId && item.headings && item.headings.length > 0) {
          // 見出しの階層構造を処理
          headingsCreated += await this.processHeadings(prisma, articleId, item.headings);
        }
      }

      return {
        articlesCreated: articles.count,
        innerLinksCreated: innerLinks.length,
        headingsCreated
      };
    });
  }

  /**
   * 見出しの階層構造を処理して保存
   * @param prisma Prismaクライアント
   * @param articleId 記事ID
   * @param headings 見出し配列
   * @param parentId 親見出しID
   * @param order 表示順序
   * @returns 作成された見出しの数
   */
  private async processHeadings(
    prisma: any,
    articleId: number,
    headings: HeadingItem[],
    parentId: number = null,
    order: number = 0
  ): Promise<number> {
    let count = 0;

    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const level = parseInt(heading.tag?.substring(1) || heading.level.toString());
      
      // 見出しを作成
      const createdHeading = await prisma.heading.create({
        data: {
          articleId,
          tag: heading.tag || `h${heading.level}`,
          text: heading.text,
          level,
          parentId,
          order: order + i
        }
      });
      
      count++;

      // 子見出しを再帰的に処理
      if (heading.children && heading.children.length > 0) {
        count += await this.processHeadings(
          prisma,
          articleId,
          heading.children,
          createdHeading.id,
          order + headings.length + i * 100 // 子要素の順序を親要素より大きくする
        );
      }
    }

    return count;
  }

  /**
   * ユーザーIDに紐づくスクレイピング結果を取得
   * @param userId 
   * @returns 
   */
  async findByUserId(userId: number) {
    return this.prismaService.article.findMany({
      where: {
        project: {
          workspace: {
            users: {
              some: {
                id: userId,
              },
            },
          },
        },
      },
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
        createdAt: 'desc',
      },
    });
  }

  /**
   * スクレイピング結果を更新
   * @param id 
   * @param data 
   * @returns 
   */
  async update(id: string, data: Partial<CreateScrapingResultDto>) {
    if (!data.scrapyingResultItems || data.scrapyingResultItems.length === 0) {
      throw new Error('更新するデータがありません');
    }

    const item = data.scrapyingResultItems[0];
    
    return this.prismaService.article.update({
      where: { id: parseInt(id) },
      data: {
        articleUrl: item.url,
        metaTitle: item.title,
        metaDescription: item.content,
        isIndexable: item.index_status === 'index',
      },
    });
  }

  /**
   * スクレイピング結果を削除
   * @param id 
   * @returns 
   */
  async delete(id: string) {
    return this.prismaService.article.delete({
      where: { id: parseInt(id) },
    });
  }
}
