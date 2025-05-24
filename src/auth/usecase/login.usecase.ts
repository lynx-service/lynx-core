import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { AuthService } from '../auth.service';

type PasswordOmitUser = Omit<User, 'password'>;

@Injectable()
export class LoginUsecase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  /**
   * ログイン処理
   * ※アクセストークンとリフレッシュトークンを返却
   *
   * @param {PasswordOmitUser} user
   * @returns {Promise<{ accessToken: string; refreshToken: string }>}
   */
  async execute(
    user: PasswordOmitUser,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.authService.generateRefreshToken();

    // リフレッシュトークンをDBに保存
    await this.authService.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }
}
