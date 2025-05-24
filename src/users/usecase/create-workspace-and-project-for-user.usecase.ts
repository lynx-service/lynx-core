import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserDao } from '../dao/user.dao';

@Injectable()
export class CreateWorkspaceAndProjectForUserUsecase {
  constructor(private readonly userDao: UserDao) {}

  /**
   * 既存ユーザーにワークスペースとプロジェクトを作成して関連付ける
   *
   * @param {number} userId ユーザーID
   * @returns {Promise<User>} 更新されたユーザー情報
   */
  async execute(userId: number): Promise<User> {
    // 既存ユーザーにワークスペースとプロジェクトを作成して関連付ける処理
    return this.userDao.createWorkspaceAndProjectForUser(userId);
  }
}
