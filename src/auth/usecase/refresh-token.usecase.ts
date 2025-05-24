import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UserDao } from 'src/users/dao/user.dao';

@Injectable()
export class RefreshTokenUsecase {
  constructor(
    private readonly userDao: UserDao,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // DBからリフレッシュトークンを検索
    const user = await this.userDao.findByRefreshToken(refreshToken);
    if (!user) {
      throw new Error('Invalid refresh token');
    }

    // 新しいトークンを生成
    const payload = { email: user.email, sub: user.id };
    const accessToken = this.jwtService.sign(payload);
    const newRefreshToken = await this.authService.generateRefreshToken();

    // 新しいリフレッシュトークンをDBに保存
    await this.authService.storeRefreshToken(user.id, newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
