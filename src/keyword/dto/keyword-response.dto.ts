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

  @ApiProperty({ description: 'CPC', example: 50, nullable: true })
  cpc: number | null;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;
}
