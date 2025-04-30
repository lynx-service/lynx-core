// src/keyword/keyword.controller.ts
import {
  Controller,
  Get, // Getを追加
  Query, // Queryを追加
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
  ApiQuery, // ApiQueryを追加
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateKeywordUsecase } from './usecase/create-keyword.usecase';
import { UpdateKeywordUsecase } from './usecase/update-keyword.usecase';
import { DeleteKeywordUsecase } from './usecase/delete-keyword.usecase';
import { ListKeywordsByProjectUsecase } from './usecase/list-keywords-by-project.usecase';
import { GetKeywordUsecase } from './usecase/get-keyword.usecase'; // GetKeywordUsecase をインポート
import { Keyword } from '@prisma/client';
import { KeywordResponseDto } from './dto/keyword-response.dto';
import { ApiParam } from '@nestjs/swagger'; // ApiParam をインポート

@ApiTags('keywords') // Swaggerのタグを設定
@ApiBearerAuth() // SwaggerでBearer認証が必要なことを示す
@UseGuards(JwtAuthGuard) // JWT認証ガードを適用
@Controller('keywords') // ルートパスを 'keywords' に変更
export class KeywordController {
  constructor(
    private readonly createKeywordUsecase: CreateKeywordUsecase,
    private readonly updateKeywordUsecase: UpdateKeywordUsecase,
    private readonly deleteKeywordUsecase: DeleteKeywordUsecase,
    private readonly listKeywordsByProjectUsecase: ListKeywordsByProjectUsecase,
    private readonly getKeywordUsecase: GetKeywordUsecase, // GetKeywordUsecase をインジェクト
  ) {}

  @Get(':id') // ID指定で取得するエンドポイント
  @ApiOperation({ summary: '指定したIDのキーワードを1件取得する' })
  @ApiParam({ name: 'id', description: '取得するキーワードのID', type: Number }) // パスパラメータの定義
  @ApiResponse({
    status: 200,
    description: 'キーワードの取得に成功しました。',
    type: KeywordResponseDto,
  })
  @ApiResponse({ status: 400, description: 'リクエストが不正です。' })
  @ApiResponse({ status: 401, description: '認証されていません。' })
  @ApiResponse({ status: 404, description: 'キーワードが見つかりません。' })
  findById(@Param('id', ParseIntPipe) id: number): Promise<KeywordResponseDto> {
    // Usecaseを実行してキーワードを取得し、DTOを返す
    return this.getKeywordUsecase.execute(id);
  }

  @Get() // プロジェクトIDで一覧取得するエンドポイント
  @ApiOperation({ summary: '指定したプロジェクトIDのキーワード一覧を取得する' })
  @ApiQuery({
    name: 'projectId',
    required: true,
    description: 'キーワードを取得するプロジェクトのID',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'キーワード一覧の取得に成功しました。',
    type: [KeywordResponseDto], // レスポンスの型を配列で示す
  })
  @ApiResponse({ status: 400, description: 'リクエストが不正です。' })
  @ApiResponse({ status: 401, description: '認証されていません。' })
  findByProjectId(
    @Query('projectId', ParseIntPipe) projectId: number, // クエリパラメータからprojectIdを取得
  ): Promise<Keyword[]> {
    // Usecaseを実行してキーワード一覧を取得
    // DTOへのマッピングはUsecase層またはここで必要に応じて行う
    // 現状はKeyword[]をそのまま返す
    return this.listKeywordsByProjectUsecase.execute(projectId);
  }

  @Post()
  @ApiOperation({ summary: 'キーワードを新規登録する' })
  @ApiResponse({
    status: 201,
    description: 'キーワードの作成に成功しました。',
    type: KeywordResponseDto, // レスポンスの型をKeywordResponseDtoに変更
  })
  @ApiResponse({ status: 400, description: 'リクエストが不正です。' })
  @ApiResponse({ status: 401, description: '認証されていません。' })
  create(@Body() createKeywordDto: CreateKeywordDto): Promise<Keyword> {
    // Usecaseを実行してキーワードを作成
    return this.createKeywordUsecase.execute(createKeywordDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '指定したIDのキーワードを更新する' })
  @ApiResponse({
    status: 200,
    description: 'キーワードの更新に成功しました。',
    type: KeywordResponseDto, // レスポンスの型をKeywordResponseDtoに変更
  })
  @ApiResponse({ status: 400, description: 'リクエストが不正です。' })
  @ApiResponse({ status: 401, description: '認証されていません。' })
  @ApiResponse({ status: 404, description: 'キーワードが見つかりません。' })
  update(
    @Param('id', ParseIntPipe) id: number, // パスパラメータからIDを取得し数値に変換
    @Body() updateKeywordDto: UpdateKeywordDto,
  ): Promise<Keyword> {
    // Usecaseを実行してキーワードを更新
    return this.updateKeywordUsecase.execute(id, updateKeywordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // 成功時のステータスコードを204に設定
  @ApiOperation({ summary: '指定したIDのキーワードを削除する' })
  @ApiResponse({
    status: 204,
    description: 'キーワードの削除に成功しました。',
  })
  @ApiResponse({ status: 401, description: '認証されていません。' })
  @ApiResponse({ status: 404, description: 'キーワードが見つかりません。' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<Keyword> {
    // Usecaseを実行してキーワードを削除
    // 削除成功時はレスポンスボディを返さないため、Promise<void> としたいが、
    // Usecaseが削除したKeywordを返すため、型を合わせる
    return this.deleteKeywordUsecase.execute(id);
  }
}
