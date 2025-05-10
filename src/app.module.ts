import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './share/prisma/prisma.module';
import { ScrapingModule } from './scraping/scraping.module';
import { KeywordModule } from './keyword/keyword.module';
import { KeywordArticleModule } from './keyword-article/keyword-article.module'; // KeywordArticleModule をインポート
import { ArticleModule } from './article/article.module'; // ArticleModule をインポート
import { ProjectModule } from './project/project.module'; // ProjectModule をインポート

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ScrapingModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KeywordModule,
    KeywordArticleModule, // KeywordArticleModule を追加
    ArticleModule, // ArticleModule を追加
    ProjectModule, // ProjectModule を追加
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
