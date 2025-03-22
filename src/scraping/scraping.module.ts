import { Module } from '@nestjs/common';
import { ScrapingController } from './scraping.controller';
import { BulkCreateScrapingResultUsecase } from './usecase/bulk-create-scraping-result.usecase';
import { GetScrapingResultUsecase } from './usecase/get-scraping-result.usecase';
import { ListScrapingResultsUsecase } from './usecase/list-scraping-results.usecase';
import { ScrapingResultDao } from './dao/scraping-result.dao';
import { PrismaModule } from 'src/share/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScrapingController],
  providers: [
    BulkCreateScrapingResultUsecase,
    GetScrapingResultUsecase,
    ListScrapingResultsUsecase,
    ScrapingResultDao
  ],
  exports: [
    BulkCreateScrapingResultUsecase,
    GetScrapingResultUsecase,
    ListScrapingResultsUsecase,
    ScrapingResultDao
  ],
})
export class ScrapingModule {}
