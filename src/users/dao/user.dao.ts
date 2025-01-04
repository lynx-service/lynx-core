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
   * ユーザーの新規登録
   *
   * @param {CreateUserDto} createUserDto
   * @returns {User}
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({ data: createUserDto });
  }

  /**
   * メールアドレスからユーザーを取得
   *
   * @param {string} email
   * @returns {User | undefined}
   */
  async findOne(email: string): Promise<User | undefined> {
    return this.prismaService.user.findUnique({ where: { email } });
  }
}
