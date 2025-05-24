import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/share/prisma/prisma.module';
import { UserDao } from './dao/user.dao';
import { UserController } from './user.controller';
import { GetUserUseCase } from './usecase/get-user.usecase';
import { CreateUserUsecase } from './usecase/create-user.usecase';
import { GetDetailedUserUsecase } from './usecase/get-detailed-user.usecase';
import { GetProjectByWorkspaceIdUsecase } from './usecase/get-project-by-workspace-id.usecase';
import { CreateWorkspaceAndProjectForUserUsecase } from './usecase/create-workspace-and-project-for-user.usecase';

@Module({
  imports: [PrismaModule],
  providers: [
    UserDao,
    GetUserUseCase,
    CreateUserUsecase,
    GetDetailedUserUsecase,
    GetProjectByWorkspaceIdUsecase,
    CreateWorkspaceAndProjectForUserUsecase,
  ],
  exports: [
    UserDao,
    CreateUserUsecase,
    GetDetailedUserUsecase,
    GetProjectByWorkspaceIdUsecase,
    CreateWorkspaceAndProjectForUserUsecase,
  ],
  controllers: [UserController],
})
export class UsersModule {}
