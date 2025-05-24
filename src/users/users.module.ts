import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/share/prisma/prisma.module';
import { UserDao } from './dao/user.dao';
import { UserController } from './user.controller';
import { GetUserUseCase } from './usecase/get-user.usecase';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, UserDao, GetUserUseCase],
  exports: [UsersService, UserDao], // UserDao をエクスポートに追加
  controllers: [UserController],
})
export class UsersModule {}
