import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'プロジェクトのURL',
    example: 'https://example.com',
  })
  @IsNotEmpty({ message: 'プロジェクトURLは必須です。' })
  @IsUrl({}, { message: '有効なURL形式で入力してください。' })
  projectUrl: string;

  @ApiProperty({
    description: 'プロジェクト名',
    example: 'マイブログ',
  })
  @IsNotEmpty({ message: 'プロジェクト名は必須です。' })
  @IsString({ message: 'プロジェクト名は文字列である必要があります。' })
  projectName: string;

  @ApiPropertyOptional({
    description: 'プロジェクトの説明（任意）',
    example: '日常の出来事を綴るブログです。',
  })
  @IsOptional()
  @IsString({ message: '説明は文字列である必要があります。' })
  description?: string;
}
