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
   * ユーザーの新規登録
   *
   * @param {CreateUserDto} createUserDto
   * @returns {User}
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({ data: createUserDto });
  }

  /**
   * リフレッシュトークンを更新
   * @param userId
   * @param refreshToken
   */
  async updateRefreshToken(userId: number, refreshToken: string): Promise<User> {
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
