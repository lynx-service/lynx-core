import { ApiProperty } from '@nestjs/swagger';
import { ArticleResponseDto } from './article-response.dto';

export class PaginatedArticlesResponseDto {
  @ApiProperty({
    type: () => [ArticleResponseDto],
    description: '記事の配列',
  })
  articles: ArticleResponseDto[];

  @ApiProperty({ description: '次に読み込むデータが存在するか', type: Boolean })
  hasNextPage: boolean;

  @ApiProperty({
    description: '次のリクエストで使用するカーソル',
    required: false,
    type: Number,
    example: 1,
  })
  nextCursor?: number;
}
