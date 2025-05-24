import { Injectable } from '@nestjs/common';
import { Project } from '@prisma/client';
import { UserDao } from '../dao/user.dao';

@Injectable()
export class GetProjectByWorkspaceIdUsecase {
  constructor(private readonly userDao: UserDao) {}

  /**
   * ワークスペースIDからプロジェクトを取得
   *
   * @param {number} workspaceId ワークスペースID
   * @returns {Promise<Project | null>} プロジェクト情報
   */
  async execute(workspaceId: number): Promise<Project | null> {
    // ワークスペースIDからプロジェクトを取得する処理
    return this.userDao.getProjectByWorkspaceId(workspaceId);
  }
}
