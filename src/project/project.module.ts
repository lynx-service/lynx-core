import { Module, forwardRef } from '@nestjs/common'; // forwardRef をインポート
import { PrismaModule } from '../share/prisma/prisma.module';
import { ProjectDao } from './dao/project.dao';
import { ProjectController } from './project.controller';
import { CreateProjectUsecase } from './usecase/create-project.usecase';
import { UsersModule } from '../users/users.module'; // UsersModuleをインポート

@Module({
  imports: [PrismaModule, forwardRef(() => UsersModule)], // UsersModule を forwardRef でラップ
  controllers: [ProjectController], // ProjectController を追加
  providers: [ProjectDao, CreateProjectUsecase], // CreateProjectUsecase を追加
  exports: [ProjectDao, CreateProjectUsecase], // CreateProjectUsecase もエクスポート（必要に応じて）
})
export class ProjectModule {}
