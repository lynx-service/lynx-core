import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { LinkKeywordArticleUsecase } from './usecase/link-keyword-article.usecase';
import { UnlinkKeywordArticleUsecase } from './usecase/unlink-keyword-article.usecase';
import { ListArticlesByKeywordUsecase } from './usecase/list-articles-by-keyword.usecase';
import { ListKeywordsByArticleUsecase } from './usecase/list-keywords-by-article.usecase';
import { KeywordArticleDto } from './dto/keyword-article.dto';
// レスポンス用の DTO をインポート
import { ArticleResponseDto } from '../article/dto/article-response.dto'; // パスを修正
import { KeywordResponseDto } from '../keyword/dto/keyword-response.dto'; // パスを修正

@ApiTags('keyword-article')
@Controller()
export class KeywordArticleController {
  constructor(
    private readonly linkKeywordArticleUsecase: LinkKeywordArticleUsecase,
    private readonly unlinkKeywordArticleUsecase: UnlinkKeywordArticleUsecase,
    private readonly listArticlesByKeywordUsecase: ListArticlesByKeywordUsecase,
    private readonly listKeywordsByArticleUsecase: ListKeywordsByArticleUsecase,
  ) {}

  @Post('keywords/:keywordId/articles/:articleId')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'キーワードと記事を関連付ける' })
  @ApiParam({ name: 'keywordId', description: 'キーワードID', type: Number })
  @ApiParam({ name: 'articleId', description: '記事ID', type: Number })
  @ApiResponse({
    status: 201,
    description: '関連付け成功',
    type: KeywordArticleDto,
  })
  @ApiResponse({ status: 404, description: 'キーワードまたは記事が見つからない' })
  @ApiResponse({ status: 409, description: '既に関連付けが存在する' })
  async linkKeywordToArticle(
    @Param('keywordId', ParseIntPipe) keywordId: number,
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<KeywordArticleDto> {
    // UseCase を実行し、結果を DTO にマッピングして返す (ここでは Prisma モデルが DTO と互換性があると仮定)
    return this.linkKeywordArticleUsecase.execute(keywordId, articleId);
  }

  @Delete('keywords/:keywordId/articles/:articleId')
  @HttpCode(HttpStatus.OK) // 削除成功時は 200 OK または 204 No Content が一般的
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
    return this.unlinkKeywordArticleUsecase.execute(keywordId, articleId);
  }

  @Get('keywords/:keywordId/articles')
  @ApiOperation({ summary: '指定したキーワードに紐づく記事一覧を取得する' })
  @ApiParam({ name: 'keywordId', description: 'キーワードID', type: Number })
  @ApiResponse({
    status: 200,
    description: '記事一覧取得成功',
    type: [ArticleResponseDto], // ArticleResponseDto を使用
  })
  @ApiResponse({ status: 404, description: 'キーワードが見つからない' })
  async listArticlesByKeyword(
    @Param('keywordId', ParseIntPipe) keywordId: number,
  ): Promise<ArticleResponseDto[]> { // 戻り値の型も DTO に合わせる (実際には UseCase が Prisma モデルを返すので、Controller でマッピングが必要になる場合があるが、ここでは型のみ修正)
    return this.listArticlesByKeywordUsecase.execute(keywordId);
  }

  @Get('articles/:articleId/keywords')
  @ApiOperation({ summary: '指定した記事に紐づくキーワード一覧を取得する' })
  @ApiParam({ name: 'articleId', description: '記事ID', type: Number })
  @ApiResponse({
    status: 200,
    description: 'キーワード一覧取得成功',
    type: [KeywordResponseDto], // KeywordResponseDto を使用
  })
  @ApiResponse({ status: 404, description: '記事が見つからない' })
  async listKeywordsByArticle(
    @Param('articleId', ParseIntPipe) articleId: number,
  ): Promise<KeywordResponseDto[]> { // 戻り値の型も DTO に合わせる
    return this.listKeywordsByArticleUsecase.execute(articleId);
  }
}
