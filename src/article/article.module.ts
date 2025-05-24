import { Module } from '@nestjs/common';
import { PrismaModule } from '../share/prisma/prisma.module';
import { ProjectModule } from '../project/project.module'; // ProjectModuleをインポート
import { ArticleController } from './article.controller';
import { ArticleDao } from './dao/article.dao';
import { ListMinimalArticlesByProjectUsecase } from './usecase/list-minimal-articles-by-project.usecase';
import { AuthModule } from 'src/auth/auth.module'; // AuthModule をインポート
import { UsersModule } from 'src/users/users.module'; // UsersModule をインポート

@Module({
  imports: [PrismaModule, ProjectModule, AuthModule, UsersModule], // AuthModule, UsersModule をインポートに追加
  controllers: [ArticleController],
  providers: [ArticleDao, ListMinimalArticlesByProjectUsecase],
  exports: [ArticleDao, ListMinimalArticlesByProjectUsecase], // 必要に応じてUsecaseもエクスポート
})
export class ArticleModule {}
