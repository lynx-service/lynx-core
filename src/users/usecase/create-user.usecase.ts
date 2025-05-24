import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UserDao } from '../dao/user.dao';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class CreateUserUsecase {
  constructor(private readonly userDao: UserDao) {}

  /**
   * ユーザーの新規登録
   *
   * @param {CreateUserDto} createUserDto
   * @returns {Promise<User>}
   */
  async execute(createUserDto: CreateUserDto): Promise<User> {
    // ユーザー作成処理
    return this.userDao.create({ ...createUserDto });
  }
}
