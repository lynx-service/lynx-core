import { ApiProperty } from '@nestjs/swagger';
import { KeywordMinimalResponseDto } from '../../keyword/dto/keyword-minimal-response.dto';

export class ArticleMinimalResponseDto {
  @ApiProperty({ description: '記事ID', example: 1 })
  id: number;

  @ApiProperty({ description: '記事タイトル', example: 'サンプル記事タイトル' })
  metaTitle: string;

  @ApiProperty({
    description: '記事URL',
    example: 'https://example.com/sample-article',
  })
  articleUrl: string;

  @ApiProperty({
    description: '記事の概要',
    example: 'これはサンプル記事の概要です。',
  })
  metaDescription: string;

  @ApiProperty({
    description: '記事に紐づくキーワードの配列',
    type: [KeywordMinimalResponseDto],
  })
  keywords: KeywordMinimalResponseDto[];
}
