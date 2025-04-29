import { ApiProperty } from '@nestjs/swagger';
import { Keyword } from '@prisma/client';

/**
 * キーワード情報のレスポンス DTO
 */
export class KeywordResponseDto implements Keyword {
  @ApiProperty({ description: 'キーワードID', example: 1 })
  id: number;

  @ApiProperty({ description: 'プロジェクトID', example: 1 })
  projectId: number;

  @ApiProperty({ description: 'キーワード名', example: 'SEO' })
  keywordName: string;

  @ApiProperty({ description: '親キーワードID', example: null, nullable: true })
  parentId: number | null;

  @ApiProperty({ description: '階層レベル', example: 1 })
  level: number;

  @ApiProperty({ description: '検索ボリューム', example: 1000 })
  searchVolume: number;

  @ApiProperty({
    description: '競合性・難易度',
    example: '中',
    nullable: true,
  })
  difficulty: string | null;

  @ApiProperty({
    description: 'メディア目的適合度',
    example: '〇',
    nullable: true,
  })
  relevance: string | null;

  @ApiProperty({
    description: 'KWの検索意図',
    example: 'Informational',
    nullable: true,
  })
  searchIntent: string | null;

  @ApiProperty({ description: 'KWの重要度', example: '高', nullable: true })
  importance: string | null;

  @ApiProperty({
    description: 'メモ欄',
    example: 'この記事で対策する',
    nullable: true,
  })
  memo: string | null;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;
}
