import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ListMinimalArticlesByProjectUsecase } from './usecase/list-minimal-articles-by-project.usecase';
import { ArticleMinimalResponseDto } from './dto/article-minimal-response.dto';

@UseGuards(JwtAuthGuard) // JWT認証ガードを適用
@ApiTags('article')
@Controller() // ベースパスを 'articles' などに設定することも検討
export class ArticleController {
  constructor(
    private readonly listMinimalArticlesByProjectUsecase: ListMinimalArticlesByProjectUsecase,
  ) {}

  @Get('projects/:projectId/articles/minimal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '指定したプロジェクトに紐づく記事の最小限の情報を一覧取得する',
  })
  @ApiParam({ name: 'projectId', description: 'プロジェクトID', type: Number })
  @ApiResponse({
    status: 200,
    description: '記事一覧取得成功',
    type: [ArticleMinimalResponseDto],
  })
  @ApiResponse({ status: 404, description: 'プロジェクトが見つからない' })
  async listMinimalArticlesByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ArticleMinimalResponseDto[]> {
    return this.listMinimalArticlesByProjectUsecase.execute(projectId);
  }
}
