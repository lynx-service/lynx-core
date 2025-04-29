import { Module } from '@nestjs/common';
import { KeywordController } from './keyword.controller';
import { KeywordDao } from './dao/keyword.dao';
import { CreateKeywordUsecase } from './usecase/create-keyword.usecase';
import { UpdateKeywordUsecase } from './usecase/update-keyword.usecase';
import { DeleteKeywordUsecase } from './usecase/delete-keyword.usecase';
import { PrismaModule } from 'src/share/prisma/prisma.module'; // PrismaModuleをインポート

@Module({
  imports: [PrismaModule], // PrismaModuleをインポート
  controllers: [KeywordController],
  providers: [
    KeywordDao,
    CreateKeywordUsecase,
    UpdateKeywordUsecase,
    DeleteKeywordUsecase,
  ], // Serviceの代わりにDAOとUsecaseを登録
  exports: [KeywordDao], // KeywordDao をエクスポートする
})
export class KeywordModule {}
