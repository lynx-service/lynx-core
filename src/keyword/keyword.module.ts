import { Module } from '@nestjs/common';
import { KeywordController } from './keyword.controller';
import { KeywordDao } from './dao/keyword.dao';
import { CreateKeywordUsecase } from './usecase/create-keyword.usecase';
import { UpdateKeywordUsecase } from './usecase/update-keyword.usecase';
import { DeleteKeywordUsecase } from './usecase/delete-keyword.usecase';
import { ListKeywordsByProjectUsecase } from './usecase/list-keywords-by-project.usecase'; // 追加
import { PrismaModule } from 'src/share/prisma/prisma.module'; // PrismaModuleをインポート

@Module({
  imports: [PrismaModule], // PrismaModuleをインポート
  controllers: [KeywordController],
  providers: [
    KeywordDao, // 重複を削除
    CreateKeywordUsecase,
    UpdateKeywordUsecase,
    DeleteKeywordUsecase,
    ListKeywordsByProjectUsecase, // 追加
  ], // Serviceの代わりにDAOとUsecaseを登録
  exports: [KeywordDao], // KeywordDao をエクスポートする
})
export class KeywordModule {}
