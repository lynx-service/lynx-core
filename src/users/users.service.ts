import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
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
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    return this.userDao.create({ ...createUserDto, password: hashedPassword });
  }

  /**
   * ログインのためのユーザー情報取得
   * 
   * @param {string} email
   * @returns {Promise<User | undefined>}
   */
  async findOne(email: string): Promise<User | undefined> {
    return this.userDao.findOne(email);
  }
}
