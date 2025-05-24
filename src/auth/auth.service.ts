import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import bcrypt = require('bcrypt');
import { User } from '@prisma/client';
import { randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

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
    let user = await this.usersService.findOne(input.email);

    if (!user) {
      // 新規ユーザー作成
      user = await this.usersService.create(input);
    }
    // 既存ユーザーの場合、または新規作成されたユーザーの場合でも、
    // ワークスペースやプロジェクトの作成はここでは行わない。
    // プロジェクト登録API側でワークスペースの存在確認・作成を行う。

    // ユーザーが存在する場合 (新規作成含む)
    if (user) {
      // リフレッシュトークンを生成して保存
      const refreshToken = await this.generateRefreshToken();
      await this.storeRefreshToken(user.id, refreshToken);
    } else {
      // 基本的にこのケースは発生しないはずだが、念のためエラーハンドリング
      // もし UsersService.create が null を返す仕様の場合は考慮が必要
      throw new Error('User could not be found or created.');
    }
    // 2重になっていたリフレッシュトークン保存処理を削除

    return user;
  }

  /**
   * ログイン処理
   * ※アクセストークンを返却
   *
   * @param {User} user
   * @returns {Promise<{ access_token: string }>}
   */
  async login(user: PasswordOmitUser): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken();
    
    // リフレッシュトークンをDBに保存
    await this.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    // DBからリフレッシュトークンを検索
    const user = await this.usersService.findByRefreshToken(refreshToken);
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // 新しいトークンを生成
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = await this.generateRefreshToken();

    // 新しいリフレッシュトークンをDBに保存
    await this.storeRefreshToken(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

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

  /**
   * リフレッシュトークンをDBに保存
   * @param userId
   * @param refreshToken
   */
  async storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
    await this.usersService.updateRefreshToken(userId, refreshToken);
  }
}
