import { Module } from '@nestjs/common';
import { PrismaModule } from '../share/prisma/prisma.module';
import { ProjectModule } from '../project/project.module';
import { ArticleController } from './article.controller';
import { ArticleDao } from './dao/article.dao';
import { ListMinimalArticlesByProjectUsecase } from './usecase/list-minimal-articles-by-project.usecase';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { BulkCreateArticlesUsecase } from './usecase/bulk-create-articles.usecase';
import { GetFormattedArticleByIdUsecase } from './usecase/get-formatted-article-by-id.usecase';
import { ListFormattedArticlesByProjectUsecase } from './usecase/list-formatted-articles-by-project.usecase';
import { ListPaginatedArticlesByProjectUsecase } from './usecase/list-paginated-articles-by-project.usecase';

@Module({
  imports: [PrismaModule, ProjectModule, AuthModule, UsersModule],
  controllers: [ArticleController],
  providers: [
    ArticleDao,
    ListMinimalArticlesByProjectUsecase,
    BulkCreateArticlesUsecase,
    GetFormattedArticleByIdUsecase,
    ListFormattedArticlesByProjectUsecase,
    ListPaginatedArticlesByProjectUsecase,
  ],
  exports: [
    ArticleDao,
    ListMinimalArticlesByProjectUsecase,
    BulkCreateArticlesUsecase,
    GetFormattedArticleByIdUsecase,
    ListFormattedArticlesByProjectUsecase,
    ListPaginatedArticlesByProjectUsecase,
  ],
})
export class ArticleModule {}
