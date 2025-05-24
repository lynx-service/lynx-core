import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Project, User, Workspace } from '@prisma/client';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { PrismaService } from 'src/share/prisma/prisma.service';

// findById, findByEmail, findOneWithProject のための型定義
const userWithWorkspaceAndProjects = Prisma.validator<Prisma.UserDefaultArgs>()(
  {
    include: {
      workspace: {
        include: {
          projects: true,
        },
      },
      role: true,
    },
  },
);

export type UserWithWorkspaceAndProjects = Prisma.UserGetPayload<
  typeof userWithWorkspaceAndProjects
>;

/**
 * UserのDBアクセスを担当するクラス
 */
@Injectable()
export class UserDao {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * ユーザーIDからユーザーを取得
   *
   * @param {number} id
   * @returns {Promise<UserWithWorkspaceAndProjects | null>}
   */
  async findById(id: number): Promise<UserWithWorkspaceAndProjects | null> {
    return this.prismaService.user.findUnique({
      where: { id },
      include: {
        workspace: {
          include: {
            projects: true,
          },
        },
        role: true,
      },
    });
  }

  /**
   * メールアドレスからユーザーを取得
   *
   * @param {string} email
   * @returns {Promise<UserWithWorkspaceAndProjects | null>}
   */
  async findByEmail(
    email: string,
  ): Promise<UserWithWorkspaceAndProjects | null> {
    return this.prismaService.user.findUnique({
      where: { email },
      include: {
        workspace: {
          include: {
            projects: true,
          },
        },
        role: true,
      },
    });
  }

  /**
   * ユーザーIDからユーザー情報とプロジェクト情報を取得
   *
   * @param {number} userId ユーザーID
   * @returns {Promise<UserWithWorkspaceAndProjects | null>}
   */
  async findOneWithProject(
    userId: number,
  ): Promise<UserWithWorkspaceAndProjects | null> {
    return this.prismaService.user.findUnique({
      where: { id: userId },
      include: {
        workspace: {
          include: {
            projects: true,
          },
        },
        role: true,
      },
    });
  }

  /**
   * ワークスペースIDからプロジェクトを取得
   *
   * @param {number} workspaceId ワークスペースID
   * @returns {Promise<Project>} プロジェクト情報
   */
  async getProjectByWorkspaceId(workspaceId: number): Promise<Project> {
    return this.prismaService.project.findFirst({
      where: { workspaceId },
    });
  }

  /**
   * ユーザーの新規登録
   *
   * @param {CreateUserDto} createUserDto
   * @returns {User}
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: {
        ...createUserDto,
      },
    });
  }

  /**
   * ユーザーにワークスペースが存在することを確認し、存在しない場合は作成して紐付ける。
   * 最終的にユーザーに紐づくワークスペースを返す。
   *
   * @param {number} userId ユーザーID
   * @returns {Promise<Workspace>} ユーザーに紐づくワークスペース
   * @throws {NotFoundException} ユーザーが見つからない場合
   */
  async ensureWorkspaceForUser(userId: number): Promise<Workspace> {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      include: { workspace: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // ユーザーに既にワークスペースが紐付いている場合はそのワークスペースを返す
    if (user.workspace) {
      return user.workspace;
    }

    // ワークスペースが存在しない場合、新しいワークスペースを作成してユーザーに紐付ける
    const newWorkspace = await this.prismaService.workspace.create({
      data: {}, // NOTE：現状、ワークスペースに特別なデータはないため空のオブジェクトを使用
    });

    // ユーザーのワークスペースIDを更新
    await this.prismaService.user.update({
      where: { id: userId },
      data: { workspaceId: newWorkspace.id },
    });

    return newWorkspace;
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
