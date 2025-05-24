import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './share/prisma/prisma.module';
import { KeywordModule } from './keyword/keyword.module';
import { KeywordArticleModule } from './keyword-article/keyword-article.module';
import { ArticleModule } from './article/article.module';
import { ProjectModule } from './project/project.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // 環境に応じた.envファイル読み込み
    }),
    KeywordModule,
    KeywordArticleModule,
    ArticleModule,
    ProjectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
