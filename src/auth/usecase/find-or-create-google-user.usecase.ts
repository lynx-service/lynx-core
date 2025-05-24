import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserDao, UserWithWorkspaceAndProjects } from 'src/users/dao/user.dao';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';

@Injectable()
export class FindOrCreateGoogleUserUsecase {
  constructor(
    private readonly userDao: UserDao,
    private readonly authService: AuthService,
  ) {}

  /**
   * Google認証ユーザーの検索または作成、およびリフレッシュトークンの処理
   * @param input - ユーザーのメールアドレスと名前
   * @returns {Promise<UserWithWorkspaceAndProjects | null>}
   */
  async execute(input: {
    email: string;
    name: string;
  }): Promise<UserWithWorkspaceAndProjects | null> {
    let user: UserWithWorkspaceAndProjects | null =
      await this.userDao.findByEmail(input.email);

    if (!user) {
      // ユーザー情報が取得できなかった場合、新規ユーザー作成
      const createUserDto: CreateUserDto = { ...input };
      const createdBasicUser = await this.userDao.create(createUserDto);

      // 作成後、リレーションを含むユーザー情報を再取得
      user = await this.userDao.findByEmail(createdBasicUser.email);

      // 再取得に失敗した場合はエラー（通常は発生しないはず）
      if (!user) {
        throw new InternalServerErrorException(
          'Failed to retrieve user after creation.',
        );
      }
    }

    // ユーザー情報が取得できた場合、リフレッシュトークンを生成して保存
    // リフレッシュトークンを生成して保存
    const refreshToken = await this.authService.generateRefreshToken();
    await this.userDao.updateRefreshToken(user.id, refreshToken);

    return user;
  }
}
