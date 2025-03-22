import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * 内部リンク情報のDTO
 */
export class InternalLinkDto {
  @IsString()
  linkUrl: string;

  @IsString()
  @IsOptional()
  anchorText?: string;

  @IsString()
  @IsOptional()
  rel?: string;

  @IsString()
  type: string;

  @IsBoolean()
  isActive: boolean;
}

/**
 * 見出し情報のDTO（再帰的な構造）
 */
export class HeadingDto {
  @IsString()
  tag: string;

  @IsString()
  text: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeadingDto)
  @IsOptional()
  children?: HeadingDto[];
}

/**
 * 記事情報のDTO
 */
export class ArticleDto {
  @IsString()
  articleUrl: string;

  @IsString()
  metaTitle: string;

  @IsString()
  metaDescription: string;

  @IsBoolean()
  isIndexable: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InternalLinkDto)
  internalLinks: InternalLinkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeadingDto)
  headings: HeadingDto[];
}

/**
 * スクレイピング結果のDTO
 */
export class CreateScrapingResultDto {
  @IsNumber()
  projectId: number;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArticleDto)
  articles: ArticleDto[];
}
