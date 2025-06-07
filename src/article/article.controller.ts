import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { ListMinimalArticlesByProjectUsecase } from './usecase/list-minimal-articles-by-project.usecase';
import { ArticleMinimalResponseDto } from './dto/article-minimal-response.dto';
import { BulkCreateArticlesUsecase } from './usecase/bulk-create-articles.usecase';
import { GetFormattedArticleByIdUsecase } from './usecase/get-formatted-article-by-id.usecase';
import { ListFormattedArticlesByProjectUsecase } from './usecase/list-formatted-articles-by-project.usecase';
import { ListPaginatedArticlesByProjectUsecase } from './usecase/list-paginated-articles-by-project.usecase';
import { BulkCreateArticlesDto } from './dto/bulk-create-articles.dto';
import { ArticleResponseDto } from './dto/article-response.dto';
import { PaginatedArticlesResponseDto } from './dto/paginated-articles-response.dto';
import { ListPaginatedArticlesDto } from './dto/list-paginated-articles.dto';
import { ArticleCreationStats } from './dao/article.dao';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('articles')
@Controller('articles')
export class ArticleController {
  constructor(
    private readonly listMinimalArticlesByProjectUsecase: ListMinimalArticlesByProjectUsecase,
    private readonly bulkCreateArticlesUsecase: BulkCreateArticlesUsecase,
    private readonly getFormattedArticleByIdUsecase: GetFormattedArticleByIdUsecase,
    private readonly listFormattedArticlesByProjectUsecase: ListFormattedArticlesByProjectUsecase,
    private readonly listPaginatedArticlesByProjectUsecase: ListPaginatedArticlesByProjectUsecase,
  ) {}

  /**
   * スクレイピング結果（記事情報）を一括保存
   * @param bulkCreateArticlesDto 記事一括作成DTO
   * @returns 保存結果の統計情報
   */
  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '記事情報を一括で作成する',
  })
  @ApiBody({ type: BulkCreateArticlesDto })
  @ApiResponse({
    status: 201,
    description: '記事の一括作成成功',
  })
  async bulkCreateArticles(
    @Body() bulkCreateArticlesDto: BulkCreateArticlesDto,
  ): Promise<ArticleCreationStats> {
    return await this.bulkCreateArticlesUsecase.execute(bulkCreateArticlesDto);
  }

  @Get('/project/:projectId/minimal')
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
    return await this.listMinimalArticlesByProjectUsecase.execute(projectId);
  }

  /**
   * プロジェクトIDに紐づく記事一覧（詳細情報を含む）を取得
   * @param projectId プロジェクトID
   * @returns 記事一覧
   */
  @Get('/project/:projectId/detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '指定したプロジェクトに紐づく記事の詳細情報を一覧取得する',
  })
  @ApiParam({ name: 'projectId', description: 'プロジェクトID', type: Number })
  @ApiResponse({
    status: 200,
    description: '記事一覧取得成功',
    type: [ArticleResponseDto],
  })
  @ApiResponse({ status: 404, description: 'プロジェクトが見つからない' })
  async listDetailedArticlesByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ArticleResponseDto[]> {
    return await this.listFormattedArticlesByProjectUsecase.execute(projectId);
  }

  /**
   * 記事IDに紐づく記事（詳細情報を含む）を取得
   * @param id 記事ID
   * @returns 記事
   */
  @Get(':id/detailed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '指定したIDの記事の詳細情報を取得する' })
  @ApiParam({ name: 'id', description: '記事ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '記事取得成功',
    type: ArticleResponseDto,
  })
  @ApiResponse({ status: 404, description: '記事が見つからない' })
  async getDetailedArticleById(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ArticleResponseDto> {
    return await this.getFormattedArticleByIdUsecase.execute(id);
  }

  /**
   * プロジェクトIDに紐づく記事一覧をページネーションで取得 (フィード形式)
   * @param projectId プロジェクトID
   * @param query ページネーションクエリパラメータ
   * @returns ページネーションされた記事一覧
   */
  @Get('/project/:projectId/feed')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      '指定したプロジェクトに紐づく記事をページネーションで取得 (フィード形式)',
  })
  @ApiParam({ name: 'projectId', description: 'プロジェクトID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'ページネーションされた記事一覧取得成功',
    type: PaginatedArticlesResponseDto,
  })
  @ApiResponse({ status: 404, description: 'プロジェクトが見つからない' })
  async listPaginatedArticlesByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() query: ListPaginatedArticlesDto,
  ): Promise<PaginatedArticlesResponseDto> {
    return await this.listPaginatedArticlesByProjectUsecase.execute(
      projectId,
      query,
    );
  }
}
