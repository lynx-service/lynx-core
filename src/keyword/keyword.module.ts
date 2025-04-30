import { Module } from '@nestjs/common';
import { KeywordController } from './keyword.controller';
import { KeywordDao } from './dao/keyword.dao';
import { CreateKeywordUsecase } from './usecase/create-keyword.usecase';
import { UpdateKeywordUsecase } from './usecase/update-keyword.usecase';
import { DeleteKeywordUsecase } from './usecase/delete-keyword.usecase';
import { ListKeywordsByProjectUsecase } from './usecase/list-keywords-by-project.usecase';
import { GetKeywordUsecase } from './usecase/get-keyword.usecase'; // GetKeywordUsecase をインポート
import { PrismaModule } from 'src/share/prisma/prisma.module'; // PrismaModuleをインポート

@Module({
  imports: [PrismaModule], // PrismaModuleをインポート
  controllers: [KeywordController],
  providers: [
    KeywordDao, // 重複を削除
    CreateKeywordUsecase,
    UpdateKeywordUsecase,
    DeleteKeywordUsecase,
    ListKeywordsByProjectUsecase,
    GetKeywordUsecase, // GetKeywordUsecase をプロバイダーに追加
  ], // Serviceの代わりにDAOとUsecaseを登録
  exports: [KeywordDao], // KeywordDao をエクスポートする
})
export class KeywordModule {}
