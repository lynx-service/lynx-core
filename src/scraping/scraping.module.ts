import { Module } from '@nestjs/common';
import { ScrapingController } from './scraping.controller';
import { BulkCreateScrapingResultUsecase } from './usecase/bulk-create-scraping-result.usecase';
import { ScrapingResultDao } from './dao/scraping-result.dao';
import { PrismaModule } from 'src/share/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScrapingController],
  providers: [BulkCreateScrapingResultUsecase, ScrapingResultDao],
  exports: [BulkCreateScrapingResultUsecase, ScrapingResultDao],
})
export class ScrapingModule {}
