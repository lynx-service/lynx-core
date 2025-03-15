import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserDao } from './dao/user.dao';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly userDao: UserDao) {}

  /**
   * ユーザーの新規登録
   *
   * @param {CreateUserDto} createUserDto
   * @returns {Promise<User>}
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    return this.userDao.create({ ...createUserDto });
  }

  /**
   * 既存ユーザーにワークスペースとプロジェクトを作成して関連付ける
   * 
   * @param {number} userId ユーザーID
   * @returns {Promise<User>} 更新されたユーザー情報
   */
  async createWorkspaceAndProjectForUser(userId: number): Promise<User> {
    return this.userDao.createWorkspaceAndProjectForUser(userId);
  }

  /**
   * ログインのためのユーザー情報取得
   *
   * @param {string} email
   * @returns {Promise<User | undefined>}
   */
  async findOne(email: string): Promise<User | undefined> {
    return this.userDao.findByEmail(email);
  }

  /**
   * リフレッシュトークンを更新
   *
   * @param {string} userId
   * @param {string} refreshToken
   * @returns {Promise<User>}
   */
  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<User> {
    return this.userDao.updateRefreshToken(userId, refreshToken);
  }

  /**
   * リフレッシュトークンからユーザーを取得
   * 
   * @param {string} refreshToken
   * @returns {Promise<User | undefined>}
   */
  async findByRefreshToken(refreshToken: string): Promise<User | undefined> {
    return this.userDao.findByRefreshToken(refreshToken);
  }
}
