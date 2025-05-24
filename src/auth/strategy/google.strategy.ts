import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { FindOrCreateGoogleUserUsecase } from '../usecase/find-or-create-google-user.usecase';
import { User } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly findOrCreateGoogleUserUsecase: FindOrCreateGoogleUserUsecase,
  ) {
    // 環境変数からバックエンドURLを取得してコールバックURLを生成
    let backendUrl = configService.get<string>('BACKEND_URL');

    // 本番環境の場合、または環境変数が設定されていない場合は本番URLを使用
    if (process.env.NODE_ENV === 'production' || !backendUrl) {
      backendUrl = 'https://lynx-core.onrender.com';
    }

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${backendUrl}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { emails, displayName } = profile;

    // ユーザー情報をUsecaseに渡して処理
    const userToFindOrCreate = {
      email: emails[0].value,
      name: displayName,
    };

    try {
      const user: User =
        await this.findOrCreateGoogleUserUsecase.execute(userToFindOrCreate);
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
