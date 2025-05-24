import {
  Controller,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LinkKeywordArticleUsecase } from './usecase/link-keyword-article.usecase';
import { UnlinkKeywordArticleUsecase } from './usecase/unlink-keyword-article.usecase';
import { KeywordArticleDto } from './dto/keyword-article.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiTags('keyword-article')
@Controller('keyword-article')
export class KeywordArticleController {
  constructor(
    private readonly linkKeywordArticleUsecase: LinkKeywordArticleUsecase,
    private readonly unlinkKeywordArticleUsecase: UnlinkKeywordArticleUsecase,
  ) {}

  @Post(':keywordId/link/:articleId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'キーワードと記事を関連付ける' })
  @ApiParam({ name: 'keywordId', description: 'キーワードID', type: Number })
  @ApiParam({ name: 'articleId', description: '記事ID', type: Number })
  @ApiResponse({
    status: 201,
    description: '関連付け成功',
    type: KeywordArticleDto,
  })
  @ApiResponse({
    status: 404,
    description: 'キーワードまたは記事が見つからない',
  })
  @ApiResponse({ status: 409, description: '既に関連付けが存在する' })
  async linkKeywordToArticle(
    @Param('keywordId', ParseIntPipe) keywordId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<KeywordArticleDto> {
    return await this.linkKeywordArticleUsecase.execute(keywordId, articleId);
  }

  @Delete(':keywordId/unlink/:articleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'キーワードと記事の関連付けを解除する' })
  @ApiParam({ name: 'keywordId', description: 'キーワードID', type: Number })
  @ApiParam({ name: 'articleId', description: '記事ID', type: Number })
  @ApiResponse({
    status: 200,
    description: '関連付け解除成功',
    type: KeywordArticleDto,
  })
  @ApiResponse({ status: 404, description: '関連付けが見つからない' })
  async unlinkKeywordFromArticle(
    @Param('keywordId', ParseIntPipe) keywordId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<KeywordArticleDto> {
    return await this.unlinkKeywordArticleUsecase.execute(keywordId, articleId);
  }
}
