import { Controller, Post, Body, UseGuards, Get, Req, Redirect } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config'; // ConfigServiceをインポート

@Controller('auth')
export class AuthController {
  // ConfigServiceをインジェクト
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // GoogleストラテジーによってGoogleログインページにリダイレクト
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  async googleAuthRedirect(@Req() req) {
    const tokens = await this.authService.login(req.user);
    
    // 環境変数からフロントエンドURLを取得
    let frontendBaseUrl = this.configService.get<string>('FRONTEND_URL');
    
    // 本番環境の場合、または環境変数が設定されていない場合は本番URLを使用
    if (process.env.NODE_ENV === 'production' || !frontendBaseUrl) {
      frontendBaseUrl = 'https://lynx-frontend.onrender.com';
    }
    
    const frontendUrl = new URL(`${frontendBaseUrl}/auth/success`);
    frontendUrl.searchParams.set('token', tokens.accessToken);
    frontendUrl.searchParams.set('refreshToken', tokens.refreshToken);

    return { url: frontendUrl.toString() };
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
