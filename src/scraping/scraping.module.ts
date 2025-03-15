import { Module } from '@nestjs/common';
import { ScrapingController } from './scraping.controller';
import { ScrapingService } from './scraping.service';
import { ScrapingResultDao } from './dao/scraping-result.dao';
import { PrismaModule } from '../share/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ScrapingController],
  providers: [ScrapingService, ScrapingResultDao],
  exports: [ScrapingService],
})
export class ScrapingModule {}
