import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { PrismaService } from 'src/share/prisma/prisma.service';

@Injectable()
/**
 * UserのDBアクセスを担当するクラス
 */
export class UserDao {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * ユーザーIDからユーザーを取得
   *
   * @param {number} id
   * @returns {Promise<User>}
   */
  async findById(id: number): Promise<User> {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  /**
   * メールアドレスからユーザーを取得
   *
   * @param {string} email
   * @returns {User | undefined}
   */
  async findByEmail(email: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({ where: { email } });
  }

  /**
   * ユーザーIDからユーザー情報とプロジェクト情報を取得
   *
   * @param {number} userId ユーザーID
   * @returns {Promise<User>} ユーザーとプロジェクトの情報
   */
  async findOneWithProject(userId: number): Promise<User> {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        workspace: true,
      },
    });
  }

  /**
   * ワークスペースIDからプロジェクトを取得
   *
   * @param {number} workspaceId ワークスペースID
   * @returns {Promise<Project>} プロジェクト情報
   */
  async getProjectByWorkspaceId(workspaceId: number): Promise<any> {
    return this.prismaService.project.findFirst({
      where: { workspaceId },
    });
  }

  /**
   * ユーザーの新規登録
   * ワークスペースとデフォルトプロジェクトも同時に作成
   *
   * @param {CreateUserDto} createUserDto
   * @returns {User}
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prismaService.$transaction(async (prisma) => {
      // 1. ワークスペースを作成
      const workspace = await prisma.workspace.create({
        data: {},
      });

      // 2. デフォルトプロジェクトを作成
      await prisma.project.create({
        data: {
          workspaceId: workspace.id,
          projectUrl: 'https://example.com',
          projectName: 'マイプロジェクト',
          description: 'デフォルトプロジェクト',
        },
      });

      // 3. ユーザーを作成し、ワークスペースと関連付け
      return prisma.user.create({
        data: {
          ...createUserDto,
          workspaceId: workspace.id,
        },
      });
    });
  }

  /**
   * 既存ユーザーにワークスペースとプロジェクトを作成して関連付ける
   *
   * @param {number} userId ユーザーID
   * @returns {Promise<User>} 更新されたユーザー情報
   */
  async createWorkspaceAndProjectForUser(userId: number): Promise<User> {
    return this.prismaService.$transaction(async (prisma) => {
      // 1. ワークスペースを作成
      const workspace = await prisma.workspace.create({
        data: {},
      });

      // 2. デフォルトプロジェクトを作成
      await prisma.project.create({
        data: {
          workspaceId: workspace.id,
          projectUrl: 'https://example.com',
          projectName: 'マイプロジェクト',
          description: 'デフォルトプロジェクト',
        },
      });

      // 3. ユーザーを更新し、ワークスペースと関連付け
      return prisma.user.update({
        where: { id: userId },
        data: {
          workspaceId: workspace.id,
        },
      });
    });
  }

  /**
   * リフレッシュトークンを更新
   * @param userId
   * @param refreshToken
   */
  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<User> {
    return this.prismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: refreshToken,
      },
    });
  }

  /**
   * リフレッシュトークンからユーザーを取得
   * @param refreshToken
   * @returns {Promise<User | undefined>}
   */
  async findByRefreshToken(refreshToken: string): Promise<User | undefined> {
    return this.prismaService.user.findFirst({
      where: {
        refreshToken: refreshToken,
      },
    });
  }
}
