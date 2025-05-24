import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCreatedResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { Project } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { ProjectResponseDto } from './dto/project-response.dto'; // 追加
import { CreateProjectUsecase } from './usecase/create-project.usecase';
import { Request } from 'express'; // Requestオブジェクトの型

// ExpressのRequest型を拡張してuserプロパティを持たせる
interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

@ApiTags('projects')
@ApiBearerAuth() // SwaggerでBearer Token認証が必要なことを示す
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly createProjectUsecase: CreateProjectUsecase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '新しいプロジェクトを作成します' })
  @ApiCreatedResponse({
    description: 'プロジェクトが正常に作成されました。',
    type: ProjectResponseDto, // ProjectResponseDto を使用
  })
  @ApiBody({ type: CreateProjectDto })
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: AuthenticatedRequest, // 型付けされたRequestオブジェクト
  ): Promise<Project> {
    // JwtAuthGuardによってreq.userにユーザー情報が設定される想定
    const userId = req.user.id;
    return this.createProjectUsecase.execute(createProjectDto, userId);
  }
}
