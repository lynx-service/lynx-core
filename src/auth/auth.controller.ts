import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Redirect,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { LoginUsecase } from './usecase/login.usecase';
import { RefreshTokenUsecase } from './usecase/refresh-token.usecase';
import { User } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly configService: ConfigService,
    private readonly loginUsecase: LoginUsecase,
    private readonly refreshTokenUsecase: RefreshTokenUsecase,
  ) {}

  /**
   * Google認証のためのエンドポイント
   * @returns Googleログインページへのリダイレクト
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth認証を開始' })
  @ApiResponse({
    status: 302,
    description: 'Googleログインページへリダイレクトします。',
  })
  async googleAuth() {
    // GoogleストラテジーによってGoogleログインページにリダイレクト
  }

  /**
   * Google認証のコールバックエンドポイント
   * @param req リクエストオブジェクト
   * @returns フロントエンドの成功ページへのリダイレクトURL
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @Redirect()
  @ApiOperation({ summary: 'Google OAuth認証コールバック' })
  @ApiResponse({
    status: 302,
    description: '認証成功後、トークンを含むURLへリダイレクトします。',
  })
  async googleAuthRedirect(@Req() req: { user: Omit<User, 'password'> }) {
    // accessTokenとrefreshTokenを生成して取得
    const tokens = await this.loginUsecase.execute(req.user);

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

  /**
   * refreshTokenを使用してアクセストークンとリフレッシュトークンを更新するエンドポイント
   * @param body リクエストボディ
   * @returns アクセストークンとリフレッシュトークン
   */
  @Post('refresh')
  @ApiOperation({ summary: 'アクセストークンをリフレッシュ' })
  @ApiBody({
    description: 'リフレッシュトークン',
    schema: {
      type: 'object',
      properties: { refreshToken: { type: 'string' } },
    },
  })
  @ApiResponse({
    status: 200,
    description: '新しいアクセストークンとリフレッシュトークンを返します。',
  })
  @ApiResponse({ status: 401, description: '無効なリフレッシュトークンです。' })
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.refreshTokenUsecase.execute(refreshToken);
  }

  // TODO：アクセストークン取得用のエンドポイントを実装

  // TODO：ログアウト用のエンドポイントを実装
}
