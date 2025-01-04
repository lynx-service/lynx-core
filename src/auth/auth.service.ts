import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import bcrypt = require('bcrypt');
import { User } from '@prisma/client';

type PasswordOmitUser = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * ユーザーの認証
   * 
   * @param {string} email
   * @param {string} pass
   * @returns {Promise<any>}
   */
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && bcrypt.compareSync(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * ログイン処理
   * ※アクセストークンを返却
   * 
   * @param {User} user
   * @returns {Promise<{ access_token: string }>}
   */
  async login(user: PasswordOmitUser): Promise<{ access_token: string }> {
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
