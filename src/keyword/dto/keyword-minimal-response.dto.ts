import { ApiProperty } from '@nestjs/swagger';

export class KeywordMinimalResponseDto {
  @ApiProperty({ description: 'キーワードID', example: 1 })
  id: number;

  @ApiProperty({ description: 'キーワード名', example: 'サンプルキーワード' })
  keywordName: string;
}
