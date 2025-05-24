import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '../share/prisma/prisma.module';
import { ProjectDao } from './dao/project.dao';
import { ProjectController } from './project.controller';
import { CreateProjectUsecase } from './usecase/create-project.usecase';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, forwardRef(() => UsersModule)],
  controllers: [ProjectController],
  providers: [ProjectDao, CreateProjectUsecase],
  exports: [ProjectDao, CreateProjectUsecase],
})
export class ProjectModule {}
