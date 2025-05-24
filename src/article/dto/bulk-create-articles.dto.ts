import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * リンクステータス情報のDTO
 */
export class LinkStatusDto {
  @IsNumber()
  code: number;

  @IsString()
  @IsOptional()
  redirectUrl?: string;
}

/**
 * 内部リンク情報のDTO
 */
export class InternalLinkDto {
  @IsString()
  linkUrl: string;

  @IsString()
  @IsOptional()
  anchorText?: string;

  @IsBoolean()
  isFollow: boolean;

  @ValidateNested()
  @Type(() => LinkStatusDto)
  status: LinkStatusDto;
}

/**
 * 外部リンク情報のDTO
 */
export class OuterLinkDto {
  @IsString()
  linkUrl: string;

  @IsString()
  @IsOptional()
  anchorText?: string;

  @IsBoolean()
  isFollow: boolean;

  @ValidateNested()
  @Type(() => LinkStatusDto)
  status: LinkStatusDto;
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
 * 記事作成詳細情報のDTO
 */
export class CreateArticleDetailDto {
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
  @Type(() => OuterLinkDto)
  outerLinks: OuterLinkDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeadingDto)
  headings: HeadingDto[];

  @IsArray()
  @IsOptional()
  jsonLd?: any[];
}

/**
 * 記事一括作成のDTO
 */
export class BulkCreateArticlesDto {
  @IsNumber()
  projectId: number;
  
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateArticleDetailDto)
  articles: CreateArticleDetailDto[];
}
