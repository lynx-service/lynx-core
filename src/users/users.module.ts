import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/share/prisma/prisma.module';
import { UserDao } from './dao/user.dao';

@Module({
  imports: [PrismaModule],
  providers: [UsersService, UserDao],
  exports: [UsersService],
})
export class UsersModule {}
