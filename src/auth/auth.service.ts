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

  async findOrCreateUser(input: {
    email: string;
    name: string;
  }): Promise<User> {
    const user = await this.usersService.findOne(input.email);

    if (user) {
      return user;
    }

    return await this.usersService.create(input);
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
