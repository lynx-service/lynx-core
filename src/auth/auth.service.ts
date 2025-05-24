import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';
import { UserDao } from 'src/users/dao/user.dao'; // UserDaoをインポート

type PasswordOmitUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(private readonly userDao: UserDao) {} // UsersServiceの代わりにUserDaoを注入

  /**
   * リフレッシュトークン生成
   */
  async generateRefreshToken(): Promise<string> {
    const random = randomBytes(8).toString('hex');
    const asyncScrypt = promisify(scrypt);
    const hashed = (await asyncScrypt(random, 'salt', 32)) as Buffer;
    const token = hashed.toString('hex');
    return token;
  }
}
