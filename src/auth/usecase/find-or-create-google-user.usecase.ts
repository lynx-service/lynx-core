import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from '../auth.service';
import { UserDao } from 'src/users/dao/user.dao';
import { CreateUserUsecase } from 'src/users/usecase/create-user.usecase';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class FindOrCreateGoogleUserUsecase {
  constructor(
    private readonly userDao: UserDao,
    private readonly createUserUsecase: CreateUserUsecase,
    private readonly authService: AuthService,
  ) {}

  /**
   * Google認証ユーザーの検索または作成、およびリフレッシュトークンの処理
   * @param input - ユーザーのメールアドレスと名前
   * @returns {Promise<User>} - 検索または作成されたユーザー
   */
  async execute(input: { email: string; name: string }): Promise<User> {
    let user = await this.userDao.findByEmail(input.email);

    if (!user) {
      // 新規ユーザー作成
      const createUserDto: CreateUserDto = { ...input };
      user = await this.createUserUsecase.execute(createUserDto);
    }
    // 既存ユーザーの場合、または新規作成されたユーザーの場合でも、
    // ワークスペースやプロジェクトの作成はここでは行わない。

    // ユーザーが存在する場合 (新規作成含む)
    if (user) {
      // リフレッシュトークンを生成して保存
      const refreshToken = await this.authService.generateRefreshToken();
      await this.authService.storeRefreshToken(user.id, refreshToken);
    } else {
      // このケースは通常発生しない想定
      throw new Error('User could not be found or created.');
    }
    return user;
  }
}
