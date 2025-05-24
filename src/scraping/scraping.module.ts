import { Module } from '@nestjs/common';
import { ScrapingController } from './scraping.controller';
import { BulkCreateScrapingResultUsecase } from './usecase/bulk-create-scraping-result.usecase';
import { GetScrapingResultUsecase } from './usecase/get-scraping-result.usecase';
import { ListScrapingResultsUsecase } from './usecase/list-scraping-results.usecase';
import { ScrapingResultDao } from './dao/scraping-result.dao';
import { PrismaModule } from 'src/share/prisma/prisma.module';
import { UsersModule } from '../users/users.module'; // UsersModule をインポート
import { ProjectModule } from '../project/project.module'; // ProjectModule をインポート
import { AuthModule } from 'src/auth/auth.module'; // AuthModuleもインポート (JwtAuthGuardがAuthModuleで提供されている場合)

@Module({
  imports: [PrismaModule, UsersModule, ProjectModule, AuthModule], // UsersModule, ProjectModule, AuthModule をインポートに追加
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
