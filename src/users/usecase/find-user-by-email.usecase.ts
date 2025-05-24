import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserDao } from '../dao/user.dao';

@Injectable()
export class FindUserByEmailUsecase {
  constructor(private readonly userDao: UserDao) {}

  async execute(email: string): Promise<User | null> {
    return this.userDao.findByEmail(email);
  }
}
