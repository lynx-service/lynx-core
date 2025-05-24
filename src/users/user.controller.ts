import {
  Get,
  UseGuards,
  Request,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserDao } from './dao/user.dao';
import { UserProfileDto } from './dto/user-profile.dto';
import { ProjectResponseDto } from '../project/dto/project-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userDao: UserDao) {}

  /**
   * ユーザー情報を取得するエンドポイント
   * @returns {Promise<UserProfileDto>} ユーザー情報
   */
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: '認証されたユーザーのプロフィール情報を取得' })
  @ApiResponse({
    status: 200,
    description: 'ユーザープロフィール情報を返します。',
    type: UserProfileDto,
  })
  @ApiResponse({ status: 401, description: '認証されていません。' })
  @ApiResponse({ status: 404, description: 'ユーザーが見つかりません。' })
  async me(@Request() req): Promise<UserProfileDto> {
    // リクエストからユーザーIDを取得
    const userId = req.user.id as number;

    // ユーザー情報を取得
    const user = await this.userDao.findById(userId);

    if (!user) {
      // JWTが有効であれば基本的にはユーザーは存在するはずですが、念のためチェック
      throw new NotFoundException(`User with ID ${userId} not found.`);
    }

    // ユーザー情報からプロジェクト情報を抽出
    // NOTE：ユーザーはワークスペースに紐づいているため、プロジェクト情報はワークスペースから取得
    const projects: ProjectResponseDto[] =
      user.workspace?.projects?.map((p) => ({
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
      projects,
    };
  }
}
