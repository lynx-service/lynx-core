import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../share/prisma/prisma.service';
import { Prisma, Project } from '@prisma/client';
import { CreateProjectDto } from '../dto/create-project.dto';

@Injectable()
export class ProjectDao {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 指定されたIDのプロジェクトを取得する
   * @param projectId プロジェクトID
   * @returns プロジェクト or null
   */
  async findById(projectId: number): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id: projectId },
    });
  }

  /**
   * 新しいプロジェクトを作成する
   * @param createProjectDto プロジェクト作成情報
   * @param workspaceId ワークスペースID
   * @returns 作成されたプロジェクト
   */
  async create(
    createProjectDto: CreateProjectDto,
    workspaceId: number,
  ): Promise<Project> {
    const { projectUrl, projectName, description } = createProjectDto;
    return this.prisma.project.create({
      data: {
        projectUrl,
        projectName,
        description,
        workspaceId,
        // lastAcquisitionDate はユーザー指定ではないため、ここでは設定しない
      },
    });
  }

  /**
   * 指定されたワークスペースIDに紐づく最初のプロジェクトを取得する
   * @param workspaceId ワークスペースID
   * @returns プロジェクト or null
   */
  async findFirstByWorkspaceId(
    workspaceId: number,
  ): Promise<Project | null> {
    return this.prisma.project.findFirst({
      where: { workspaceId },
    });
  }
}
