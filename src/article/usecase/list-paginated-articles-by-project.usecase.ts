import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleDao, ArticleWithRelations } from '../dao/article.dao';
import { ListPaginatedArticlesDto } from '../dto/list-paginated-articles.dto';
import { PaginatedArticlesResponseDto } from '../dto/paginated-articles-response.dto';
import { ArticleResponseDto } from '../dto/article-response.dto';
import { ProjectDao } from '../../project/dao/project.dao';
import { InternalLink, OuterLink } from '@prisma/client';

// PrismaのLink型からLinkDtoへの変換ヘルパー
function mapLinkToDto(
  link: InternalLink | OuterLink,
): ArticleResponseDto['internalLinks'][0] {
  // ArticleResponseDtoのinternalLinksの要素型はLinkDtoなので、それを利用
  return {
    linkUrl: link.linkUrl,
    anchorText: link.anchorText ?? '', // nullの場合は空文字
    isFollow: link.isFollow,
    status: link.status, // Prisma.JsonValueなのでそのまま代入
  };
}

@Injectable()
export class ListPaginatedArticlesByProjectUsecase {
  constructor(
    private readonly articleDao: ArticleDao,
    private readonly projectDao: ProjectDao,
  ) {}

  async execute(
    projectId: number,
    query: ListPaginatedArticlesDto,
  ): Promise<PaginatedArticlesResponseDto> {
    const project = await this.projectDao.findById(projectId);
    if (!project) {
      throw new NotFoundException(
        `プロジェクトが見つかりません: id=${projectId}`,
      );
    }

    const { cursor, take } = query;
    const limit = take;
    const itemsToFetch = limit + 1;

    const fetchedArticles: ArticleWithRelations[] =
      await this.articleDao.findPaginatedByProjectId(
        projectId,
        cursor,
        itemsToFetch,
      );

    const hasNextPage = fetchedArticles.length > limit;
    const articlesForResponse = hasNextPage
      ? fetchedArticles.slice(0, limit)
      : fetchedArticles;

    const articleDtos: ArticleResponseDto[] = articlesForResponse.map(
      (article) => {
        // ArticleWithRelations から ArticleResponseDto への変換
        const dto: ArticleResponseDto = {
          id: article.id,
          projectId: article.projectId,
          articleUrl: article.articleUrl,
          metaTitle: article.metaTitle,
          metaDescription: article.metaDescription,
          isIndexable: article.isIndexable,
          headings: article.headings, // Prisma.JsonValueなのでそのまま
          jsonLd: article.jsonLd, // Prisma.JsonValueなのでそのまま
          createdAt: article.createdAt,
          updatedAt: article.updatedAt,
          internalLinks: article.internalLinks?.map(mapLinkToDto) || [],
          outerLinks: article.outerLinks?.map(mapLinkToDto) || [],
        };
        return dto;
      },
    );

    let nextCursor: number | undefined = undefined;
    if (hasNextPage && articlesForResponse.length > 0) {
      nextCursor = articlesForResponse[articlesForResponse.length - 1].id;
    }

    return {
      articles: articleDtos,
      hasNextPage,
      nextCursor,
    };
  }
}
