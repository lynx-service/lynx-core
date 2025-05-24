import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { Project } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto';
import { CreateProjectUsecase } from './usecase/create-project.usecase';
import { Request } from 'express';

// ExpressのRequest型を拡張してuserプロパティを持たせる
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('projects')
@Controller('projects')
export class ProjectController {
  constructor(private readonly createProjectUsecase: CreateProjectUsecase) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '新しいプロジェクトを作成します' })
  @ApiCreatedResponse({
    description: 'プロジェクトが正常に作成されました。',
    type: ProjectResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'リクエストボディのバリデーションエラー。',
  })
  @ApiResponse({
    status: 401,
    description: '認証トークンが無効または不足。',
  })
  @ApiBody({ type: CreateProjectDto })
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<Project> {
    // JwtAuthGuardによってreq.userにユーザー情報が設定される想定
    const userId = req.user.id;
    return await this.createProjectUsecase.execute(createProjectDto, userId);
  }
}
