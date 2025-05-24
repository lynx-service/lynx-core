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
    // @Public() デコレータがある場合は認証をスキップ
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    // JWT認証自体を実行
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      // super.canActivateがfalseを返した場合、通常はUnauthorizedExceptionがスローされるが、明示的に行う
      throw new UnauthorizedException('認証されていません。');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // Passportにより設定される

    if (!user || !user.id) {
      // 通常ここには来ないはず (JWTStrategyで検証されるため)
      throw new UnauthorizedException('ユーザー情報が見つかりません。');
    }

    // プロジェクト登録APIとログアウトAPIはプロジェクト未登録でも許可
    const allowedPathsWithoutProject = ['/projects', '/auth/logout']; // TODO: /auth/google/callback なども考慮が必要か確認
    const requestPath = request.route.path; // NestJSのルーティングパスを取得

    // request.originalUrl からベースパスを除いた部分を取得する方が確実かもしれない
    // 例: /api/v1/projects -> /projects
    // ただし、ここでは request.route.path がコントローラーの @Controller('path') とメソッドの @Post('subpath') を組み合わせたものになることを期待

    if (allowedPathsWithoutProject.some(path => requestPath.startsWith(path))) {
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
