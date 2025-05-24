import { Injectable, InternalServerErrorException } from '@nestjs/common'; // InternalServerErrorException をインポート
// User 型のインポートは不要になる
import { AuthService } from '../auth.service';
import { UserDao, UserWithWorkspaceAndProjects } from 'src/users/dao/user.dao'; // UserWithWorkspaceAndProjects をインポート
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
   * @returns {Promise<UserWithWorkspaceAndProjects | null>} - 検索または作成されたユーザー
   */
  async execute(
    input: { email: string; name: string },
  ): Promise<UserWithWorkspaceAndProjects | null> {
    let user: UserWithWorkspaceAndProjects | null =
      await this.userDao.findByEmail(input.email);

    if (!user) {
      // 新規ユーザー作成
      const createUserDto: CreateUserDto = { ...input };
      const createdBasicUser =
        await this.createUserUsecase.execute(createUserDto);
      // 作成後、リレーションを含むユーザー情報を再取得
      user = await this.userDao.findByEmail(createdBasicUser.email);
      if (!user) {
        // 再取得に失敗した場合はエラー（通常は発生しないはず）
        throw new InternalServerErrorException(
          'Failed to retrieve user after creation.',
        );
      }
    }
    // 既存ユーザーの場合、または新規作成されたユーザーの場合でも、
    // ワークスペースやプロジェクトの作成はここでは行わない。

    // ユーザーが存在する場合 (新規作成含む)
    // user が null でないことを保証するためにチェック
    if (user) {
      // リフレッシュトークンを生成して保存
      const refreshToken = await this.authService.generateRefreshToken();
      await this.authService.storeRefreshToken(user.id, refreshToken);
    } else {
      // このケースは上記でエラーハンドリングされているため、通常は到達しない
      throw new InternalServerErrorException(
        'User could not be found or created and refreshToken could not be stored.',
      );
    }
    return user;
  }
}
