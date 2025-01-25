import { Injectable } from '@nestjs/common';
import { UserDao } from '../dao/user.dao';
import { User } from '@prisma/client';

@Injectable()
export class GetUserUseCase {
  constructor(private readonly userDao: UserDao) {}

  /**
   * ユーザーIDからユーザーを取得
   *
   * @param {number} id
   * @returns {Promise<User>}
   */
  async execute(id: number): Promise<User> {
    return await this.userDao.findById(id);
  }
}
