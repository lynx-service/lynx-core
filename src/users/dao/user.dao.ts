import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User, Workspace } from '@prisma/client'; // Prisma をインポート
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { PrismaService } from 'src/share/prisma/prisma.service';

// findById, findByEmail, findOneWithProject のための型定義
const userWithWorkspaceAndProjects = Prisma.validator<Prisma.UserDefaultArgs>()({
  include: {
    workspace: {
      include: {
        projects: true,
      },
    },
    role: true,
  },
});

export type UserWithWorkspaceAndProjects = Prisma.UserGetPayload< // export を追加
  typeof userWithWorkspaceAndProjects
>;

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
  async findByEmail(email: string): Promise<UserWithWorkspaceAndProjects | null> {
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
   * @returns {Promise<UserWithWorkspaceAndProjects | null>} ユーザーとプロジェクトの情報
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
    // ユーザー作成のみを行う
    // ワークスペースやプロジェクトの作成は行わない
    return this.prismaService.user.create({
      data: {
        ...createUserDto,
        // workspaceId はここでは設定しない (null になる)
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

    if (user.workspace) {
      return user.workspace;
    }

    // ワークスペースが存在しない場合、新しいワークスペースを作成してユーザーに紐付ける
    const newWorkspace = await this.prismaService.workspace.create({
      data: {}, // Workspace作成時に特別なデータが不要な場合
    });

    await this.prismaService.user.update({
      where: { id: userId },
      data: { workspaceId: newWorkspace.id },
    });

    return newWorkspace;
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
