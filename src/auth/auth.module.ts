import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategy/jwt.strategy';
import { GoogleStrategy } from './strategy/google.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { ProjectModule } from '../project/project.module'; // ProjectModule をインポート
import { FindOrCreateGoogleUserUsecase } from './usecase/find-or-create-google-user.usecase';
import { LoginUsecase } from './usecase/login.usecase';
import { RefreshTokenUsecase } from './usecase/refresh-token.usecase';

@Module({
  imports: [
    UsersModule,
    ProjectModule, // ProjectModule を追加
    PassportModule,
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        return {
          // envファイルから秘密鍵を渡す
          secret: configService.get<string>('JWT_SECRET'),
          signOptions: {
            // 有効期間を設定
            expiresIn: '100000s'
          },
        };
      },
      inject: [ConfigService], // useFactoryで使う為にConfigServiceを注入する
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    FindOrCreateGoogleUserUsecase,
    LoginUsecase,
    RefreshTokenUsecase,
  ],
  exports: [AuthService, FindOrCreateGoogleUserUsecase, LoginUsecase, RefreshTokenUsecase],
})
export class AuthModule {}
