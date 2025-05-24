import { ApiProperty } from '@nestjs/swagger';
import { KeywordArticle } from '@prisma/client';

export class KeywordArticleDto implements KeywordArticle {
  @ApiProperty({ description: 'キーワードID', example: 1 })
  keywordId: number;

  @ApiProperty({ description: '記事ID', example: 101 })
  articleId: number;

  @ApiProperty({ description: '作成日時' })
  createdAt: Date;

  @ApiProperty({ description: '更新日時' })
  updatedAt: Date;
}
