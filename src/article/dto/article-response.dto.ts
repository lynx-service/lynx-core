import { ApiProperty } from '@nestjs/swagger';
import { Article, Prisma } from '@prisma/client';

/**
 * 記事情報のレスポンス DTO
 */
export class ArticleResponseDto implements Article {
  @ApiProperty({ description: '記事ID', example: 101 })
  id: number;

  @ApiProperty({ description: 'プロジェクトID', example: 1 })
  projectId: number;

  @ApiProperty({
    description: '記事URL',
    example: 'https://example.com/article1',
  })
  articleUrl: string;

  @ApiProperty({ description: 'メタタイトル', example: '記事タイトル', nullable: true })
  metaTitle: string | null;

  @ApiProperty({
    description: 'メタディスクリプション',
    example: '記事の説明',
    nullable: true,
  })
  metaDescription: string | null;

  @ApiProperty({ description: 'インデックス可能か', example: true })
  isIndexable: boolean;

  @ApiProperty({ description: '見出し情報 (JSON)', type: 'object', nullable: true })
  headings: Prisma.JsonValue | null;

  @ApiProperty({ description: 'JSON-LD情報 (JSON)', type: 'object', nullable: true })
  jsonLd: Prisma.JsonValue | null;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;
}
