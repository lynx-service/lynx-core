import { Module } from '@nestjs/common';
import { PrismaModule } from '../share/prisma/prisma.module'; // PrismaModule をインポート
import { KeywordModule } from '../keyword/keyword.module'; // KeywordModule をインポート
import { ScrapingModule } from '../scraping/scraping.module'; // ScrapingModule をインポート
import { KeywordArticleController } from './keyword-article.controller';
import { KeywordArticleDao } from './dao/keyword-article.dao';
import { LinkKeywordArticleUsecase } from './usecase/link-keyword-article.usecase';
import { UnlinkKeywordArticleUsecase } from './usecase/unlink-keyword-article.usecase';
import { ListArticlesByKeywordUsecase } from './usecase/list-articles-by-keyword.usecase';
import { ListKeywordsByArticleUsecase } from './usecase/list-keywords-by-article.usecase';

@Module({
  imports: [
    PrismaModule, // PrismaService を利用可能にする
    KeywordModule, // KeywordDao を利用可能にする (KeywordModule でのエクスポートが必要)
    ScrapingModule, // ScrapingResultDao を利用可能にする (ScrapingModule でのエクスポートが必要)
  ],
  controllers: [KeywordArticleController],
  providers: [
    KeywordArticleDao,
    LinkKeywordArticleUsecase,
    UnlinkKeywordArticleUsecase,
    ListArticlesByKeywordUsecase,
    ListKeywordsByArticleUsecase,
  ],
})
export class KeywordArticleModule {}
