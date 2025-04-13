import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService,
    private readonly authService: AuthService
  ) {
    // 環境変数からバックエンドURLを取得してコールバックURLを生成
    const backendUrl = configService.get<string>('BACKEND_URL');
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${backendUrl}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { emails, displayName } = profile;

    // ユーザー情報をAuthServiceに渡して処理
    const user = await this.authService.findOrCreateUser({
      email: emails[0].value,
      name: displayName,
    });

    return user;
  }
}
