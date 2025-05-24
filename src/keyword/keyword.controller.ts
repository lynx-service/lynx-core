import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateKeywordDto } from './dto/create-keyword.dto';
import { UpdateKeywordDto } from './dto/update-keyword.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateKeywordUsecase } from './usecase/create-keyword.usecase';
import { UpdateKeywordUsecase } from './usecase/update-keyword.usecase';
import { DeleteKeywordUsecase } from './usecase/delete-keyword.usecase';
import { ListKeywordsByProjectUsecase } from './usecase/list-keywords-by-project.usecase';
import { GetKeywordUsecase } from './usecase/get-keyword.usecase';
import { KeywordResponseDto } from './dto/keyword-response.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('keywords')
@Controller('keywords')
export class KeywordController {
  constructor(
    private readonly createKeywordUsecase: CreateKeywordUsecase,
    private readonly updateKeywordUsecase: UpdateKeywordUsecase,
    private readonly deleteKeywordUsecase: DeleteKeywordUsecase,
    private readonly listKeywordsByProjectUsecase: ListKeywordsByProjectUsecase,
    private readonly getKeywordUsecase: GetKeywordUsecase,
  ) {}

  /**
   * キーワードを新規登録するエンドポイント
   * @param createKeywordDto キーワード作成用のDTO
   * @returns 作成されたキーワードのレスポンスDTO
   */
  @Post()
  @ApiOperation({ summary: 'キーワードを新規登録する' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'キーワードの作成に成功しました。',
    type: KeywordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'リクエストが不正です。',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '認証されていません。',
  })
  async createKeyword(
    @Body() createKeywordDto: CreateKeywordDto,
  ): Promise<KeywordResponseDto> {
    return await this.createKeywordUsecase.execute(createKeywordDto);
  }

  /**
   * 指定したプロジェクトIDのキーワード一覧を取得するエンドポイント
   * @param projectId プロジェクトのID
   * @returns キーワードのレスポンスDTOの配列
   */
  @Get('project/:projectId')
  @ApiOperation({ summary: '指定したプロジェクトIDのキーワード一覧を取得する' })
  @ApiParam({
    name: 'projectId',
    required: true,
    description: 'キーワードを取得するプロジェクトのID',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'キーワード一覧の取得に成功しました。',
    type: [KeywordResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'リクエストが不正です。',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '認証されていません。',
  })
  async listKeywordsByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<KeywordResponseDto[]> {
    return await this.listKeywordsByProjectUsecase.execute(projectId);
  }

  /**
   * 指定したキーワードIDのキーワードを取得するエンドポイント
   * @param keywordId キーワードのID
   * @returns キーワードのレスポンスDTO
   */
  @Get(':keywordId')
  @ApiOperation({ summary: '指定したIDのキーワードを1件取得する' })
  @ApiParam({
    name: 'keywordId',
    description: '取得するキーワードのID',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'キーワードの取得に成功しました。',
    type: KeywordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'リクエストが不正です。',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '認証されていません。',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'キーワードが見つかりません。',
  })
  async getKeywordById(
    @Param('keywordId', ParseIntPipe) keywordId: number,
  ): Promise<KeywordResponseDto> {
    return this.getKeywordUsecase.execute(keywordId);
  }

  /**
   * 指定したキーワードIDのキーワードを更新するエンドポイント
   * @param keywordId キーワードのID
   * @param updateKeywordDto 更新用のDTO
   * @returns 更新されたキーワードのレスポンスDTO
   */
  @Patch(':keywordId')
  @ApiOperation({ summary: '指定したIDのキーワードを更新する' })
  @ApiParam({
    name: 'keywordId',
    description: '更新するキーワードのID',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'キーワードの更新に成功しました。',
    type: KeywordResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'リクエストが不正です。',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '認証されていません。',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'キーワードが見つかりません。',
  })
  async updateKeyword(
    @Param('keywordId', ParseIntPipe) keywordId: number,
    @Body() updateKeywordDto: UpdateKeywordDto,
  ): Promise<KeywordResponseDto> {
    return await this.updateKeywordUsecase.execute(keywordId, updateKeywordDto);
  }

  /**
   * 指定したキーワードIDのキーワードを削除するエンドポイント
   * @param keywordId キーワードのID
   * @returns 削除成功時は204 No Contentを返す
   */
  @Delete(':keywordId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '指定したIDのキーワードを削除する' })
  @ApiParam({
    name: 'keywordId',
    description: '削除するキーワードのID',
    type: Number,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'キーワードの削除に成功しました。',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: '認証されていません。',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'キーワードが見つかりません。',
  })
  async deleteKeyword(
    @Param('keywordId', ParseIntPipe) keywordId: number,
  ): Promise<void> {
    await this.deleteKeywordUsecase.execute(keywordId);
  }
}
