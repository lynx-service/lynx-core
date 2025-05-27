import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { UserDao } from '../../users/dao/user.dao';
import { ProjectDao } from '../../project/dao/project.dao';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly userDao: UserDao,
    private readonly projectDao: ProjectDao,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // まず、@Public()デコレーターが付いているかを確認
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // @Public()が付いている場合は認証をスキップ
    if (isPublic) {
      return true;
    }

    // JWT認証の実行
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      throw new UnauthorizedException('認証されていません。');
    }

    // 認証が成功した場合、ユーザー情報を取得
    const request = context.switchToHttp().getRequest();
    // request.user は Passport.js によって設定される
    const user = request.user;

    // 特定のパスはプロジェクト未登録でも許可
    const allowedPathsWithoutProject = ['/projects', '/auth/logout', '/user/me'];
    // パスの取得
    const requestPath = request.route.path;
    if (
      allowedPathsWithoutProject.some((path) => requestPath.startsWith(path))
    ) {
      return true;
    }

    // ユーザーのワークスペースとプロジェクトの存在を確認
    const dbUser = await this.userDao.findById(user.id);
    if (!dbUser || !dbUser.workspaceId) {
      // ワークスペースがない場合はプロジェクトもない
      throw new ForbiddenException(
        'プロジェクトが登録されていません。アクセスが拒否されました。',
      );
    }

    const project = await this.projectDao.findFirstByWorkspaceId(
      dbUser.workspaceId,
    );

    if (!project) {
      throw new ForbiddenException(
        'プロジェクトが登録されていません。アクセスが拒否されました。',
      );
    }

    return true;
  }
}
