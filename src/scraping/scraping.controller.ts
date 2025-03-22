import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateScrapingResultDto } from './dto/create-scraping-result.dto';
import { BulkCreateScrapingResultUsecase } from './usecase/bulk-create-scraping-result.usecase';
import { GetScrapingResultUsecase } from './usecase/get-scraping-result.usecase';
import { ListScrapingResultsUsecase } from './usecase/list-scraping-results.usecase';

@Controller('scraping')
export class ScrapingController {
  constructor(
    private readonly bulkCreateScrapingResultUsecase: BulkCreateScrapingResultUsecase,
    private readonly getScrapingResultUsecase: GetScrapingResultUsecase,
    private readonly listScrapingResultsUsecase: ListScrapingResultsUsecase,
  ) {}

  /**
   * スクレイピング結果を一括保存
   * @param createScrapingResultDto スクレイピング結果DTO
   * @returns 保存結果の統計情報
   */
  @Post()
  @UseGuards(JwtAuthGuard)
  async bulkCreate(@Body() createScrapingResultDto: CreateScrapingResultDto) {
    return this.bulkCreateScrapingResultUsecase.execute(createScrapingResultDto);
  }

  /**
   * プロジェクトIDに紐づく記事を取得
   * @param projectId プロジェクトID
   * @returns 記事一覧
   */
  @Get('project/:projectId')
  @UseGuards(JwtAuthGuard)
  async findByProjectId(@Param('projectId') projectId: string) {
    return this.listScrapingResultsUsecase.execute(Number(projectId));
  }

  /**
   * 記事IDに紐づく記事を取得
   * @param id 記事ID
   * @returns 記事
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findById(@Param('id') id: string) {
    return this.getScrapingResultUsecase.execute(Number(id));
  }
}
