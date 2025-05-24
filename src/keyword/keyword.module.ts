import { Module } from '@nestjs/common';
import { KeywordController } from './keyword.controller';
import { KeywordDao } from './dao/keyword.dao';
import { CreateKeywordUsecase } from './usecase/create-keyword.usecase';
import { UpdateKeywordUsecase } from './usecase/update-keyword.usecase';
import { DeleteKeywordUsecase } from './usecase/delete-keyword.usecase';
import { ListKeywordsByProjectUsecase } from './usecase/list-keywords-by-project.usecase';
import { GetKeywordUsecase } from './usecase/get-keyword.usecase';
import { PrismaModule } from 'src/share/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { ProjectModule } from 'src/project/project.module';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ProjectModule],
  controllers: [KeywordController],
  providers: [
    KeywordDao,
    CreateKeywordUsecase,
    UpdateKeywordUsecase,
    DeleteKeywordUsecase,
    ListKeywordsByProjectUsecase,
    GetKeywordUsecase,
  ],
  exports: [KeywordDao],
})
export class KeywordModule {}
