import { Module } from '@nestjs/common';
import { PrismaModule } from '../share/prisma/prisma.module';
import { KeywordModule } from '../keyword/keyword.module';
import { ArticleModule } from '../article/article.module';
import { KeywordArticleController } from './keyword-article.controller';
import { KeywordArticleDao } from './dao/keyword-article.dao';
import { LinkKeywordArticleUsecase } from './usecase/link-keyword-article.usecase';
import { UnlinkKeywordArticleUsecase } from './usecase/unlink-keyword-article.usecase';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [
    PrismaModule,
    KeywordModule,
    ArticleModule,
    AuthModule,
    UsersModule,
    ProjectModule,
  ],
  controllers: [KeywordArticleController],
  providers: [
    KeywordArticleDao,
    LinkKeywordArticleUsecase,
    UnlinkKeywordArticleUsecase,
  ],
})
export class KeywordArticleModule {}
