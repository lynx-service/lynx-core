import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateKeywordDto {
  @ApiProperty({ description: 'プロジェクトID', example: 1 })
  @IsInt({ message: 'プロジェクトIDは数値である必要があります' })
  @IsNotEmpty({ message: 'プロジェクトIDは必須です' })
  projectId: number;

  @ApiProperty({ description: 'キーワード名', example: 'SEO対策' })
  @IsString({ message: 'キーワード名は文字列である必要があります' })
  @IsNotEmpty({ message: 'キーワード名は必須です' })
  keywordName: string;

  @ApiProperty({
    description: '親キーワードID（任意）',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: '親キーワードIDは数値である必要があります' })
  parentId?: number;

  @ApiProperty({
    description: '階層レベル（任意、デフォルト1）',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt({ message: '階層レベルは数値である必要があります' })
  @Min(1, { message: '階層レベルは1以上である必要があります' })
  level?: number = 1;

  @ApiProperty({
    description: '検索ボリューム（任意、デフォルト0）',
    example: 1000,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt({ message: '検索ボリュームは数値である必要があります' })
  @Min(0, { message: '検索ボリュームは0以上である必要があります' })
  searchVolume?: number = 0;

  @ApiProperty({
    description: '競合性・難易度（任意）',
    example: '中',
    required: false,
  })
  @IsOptional()
  @IsString({ message: '競合性・難易度は文字列である必要があります' })
  difficulty?: string;

  @ApiProperty({
    description: 'メディア目的適合度（任意）',
    example: '〇',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'メディア目的適合度は文字列である必要があります' })
  relevance?: string;

  @ApiProperty({
    description: 'KWの検索意図（任意）',
    example: 'Informational',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'KWの検索意図は文字列である必要があります' })
  searchIntent?: string;

  @ApiProperty({
    description: 'KWの重要度（任意）',
    example: '高',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'KWの重要度は文字列である必要があります' })
  importance?: string;

  @ApiProperty({
    description: 'メモ欄（任意）',
    example: 'この記事で対策する',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'メモ欄は文字列である必要があります' })
  memo?: string;
}
