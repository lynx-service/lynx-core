import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectDao } from '../dao/project.dao';
import { CreateProjectDto } from '../dto/create-project.dto';
import { Project } from '@prisma/client';
import { UserDao } from '../../users/dao/user.dao';

@Injectable()
export class CreateProjectUsecase {
  constructor(
    private readonly projectDao: ProjectDao,
    private readonly userDao: UserDao,
  ) {}

  /**
   * 新しいプロジェクトを作成する
   * ユーザーにワークスペースが存在しない場合は、新しいワークスペースを作成して紐付ける。
   *
   * @param createProjectDto プロジェクト作成情報
   * @param userId リクエストユーザーのID
   * @returns 作成されたプロジェクト
   */
  async execute(
    createProjectDto: CreateProjectDto,
    userId: number,
  ): Promise<Project> {
    // 1. ユーザーに紐づくワークスペースを取得（なければ作成）
    const workspace = await this.userDao.ensureWorkspaceForUser(userId);
    if (!workspace) {
      // このケースはensureWorkspaceForUser内でエラーがスローされるはずだが念のため
      // (ensureWorkspaceForUserがnullを返すことはない想定だが、型安全のため)
      throw new NotFoundException(
        `Workspace could not be found or created for user ID ${userId}.`,
      );
    }

    // 2. プロジェクトを作成
    const project = await this.projectDao.create(
      createProjectDto,
      workspace.id,
    );

    return project;
  }
}
