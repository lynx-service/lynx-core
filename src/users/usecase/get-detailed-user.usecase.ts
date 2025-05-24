import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserDao } from '../dao/user.dao';

@Injectable()
export class GetDetailedUserUsecase {
  constructor(private readonly userDao: UserDao) {}

  /**
   * ユーザーIDからユーザー情報とプロジェクト情報を取得
   *
   * @param {number} userId ユーザーID
   * @returns {Promise<User>} ユーザーとプロジェクトの情報
   */
  async execute(userId: number): Promise<User | null> {
    // ユーザー情報とプロジェクト情報を取得する処理
    return this.userDao.findOneWithProject(userId);
  }
}
