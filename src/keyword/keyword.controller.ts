// src/keyword/keyword.controller.ts
import {
  Controller,
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
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateKeywordUsecase } from './usecase/create-keyword.usecase';
import { UpdateKeywordUsecase } from './usecase/update-keyword.usecase';
import { DeleteKeywordUsecase } from './usecase/delete-keyword.usecase';
import { Keyword } from '@prisma/client'; // Keyword型をインポート

@ApiTags('keywords') // Swaggerのタグを設定
@ApiBearerAuth() // SwaggerでBearer認証が必要なことを示す
@UseGuards(JwtAuthGuard) // JWT認証ガードを適用
@Controller('keywords') // ルートパスを 'keywords' に変更
export class KeywordController {
  constructor(
    private readonly createKeywordUsecase: CreateKeywordUsecase,
    private readonly updateKeywordUsecase: UpdateKeywordUsecase,
    private readonly deleteKeywordUsecase: DeleteKeywordUsecase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'キーワードを新規登録する' })
  @ApiResponse({
    status: 201,
    description: 'キーワードの作成に成功しました。',
    type: CreateKeywordDto, // レスポンスの型を示す (実際はKeyword型だがDTOで示すのが一般的)
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
    type: UpdateKeywordDto, // レスポンスの型を示す (実際はKeyword型だがDTOで示すのが一般的)
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
