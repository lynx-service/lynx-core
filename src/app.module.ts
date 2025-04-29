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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
