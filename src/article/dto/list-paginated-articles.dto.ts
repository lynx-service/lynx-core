import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListPaginatedArticlesDto {
  @ApiPropertyOptional({
    description: '前回のレスポンスで返されたカーソル (記事ID)',
    type: Number,
    example: 101,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  cursor?: number;

  @ApiProperty({
    description: '取得件数',
    type: Number,
    default: 20,
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  take: number = 20;
}
