import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../share/prisma/prisma.service';
import { Project } from '@prisma/client';

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
}
