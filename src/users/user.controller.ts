import { Get, UseGuards, Request, Controller, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDao } from './dao/user.dao';
// ProjectDao は不要になるので削除
import { UserProfileDto } from './dto/user-profile.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectResponseDto } from '../project/dto/project-response.dto'; // ProjectResponseDto をインポート

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userDao: UserDao,
    // private readonly projectDao: ProjectDao, // ProjectDao は不要になるので削除
  ) {}

  // アクセストークンからユーザー情報の取得
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({ status: 200, description: 'ユーザープロファイル情報', type: UserProfileDto })
  @ApiResponse({ status: 401, description: '認証エラー' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません' })
  async me(@Request() req): Promise<UserProfileDto> {
    const userId = req.user.id as number;

    const user = await this.userDao.findById(userId);
    if (!user) {
      // JWTが有効であれば基本的にはユーザーは存在するはずですが、念のためチェック
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // UserDao.findById で workspace と projects が eager load されていることを期待
    const projects: ProjectResponseDto[] = user.workspace?.projects?.map(p => ({
      id: p.id,
      workspaceId: p.workspaceId,
      projectUrl: p.projectUrl,
      projectName: p.projectName,
      description: p.description,
      lastAcquisitionDate: p.lastAcquisitionDate,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })) || [];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      workspaceId: user.workspaceId,
      projects, // projectIds を projects に変更
    };
  }
}
