import { Injectable, NotFoundException } from '@nestjs/common';
import { KeywordDao } from '../dao/keyword.dao';
import { KeywordResponseDto } from '../dto/keyword-response.dto';
import { Keyword } from '@prisma/client';

// DAOから取得するKeywordの型を定義（親子関係を含む）
type KeywordWithRelations = Keyword & {
  parentKeyword: Keyword | null;
  childKeywords: Keyword[];
};

@Injectable()
export class GetKeywordUsecase {
  constructor(private readonly keywordDao: KeywordDao) {}

  /**
   * IDでキーワードを1件取得する
   * @param id キーワードID
   * @returns キーワードレスポンスDTO
   * @throws NotFoundException キーワードが見つからない場合
   */
  async execute(id: number): Promise<KeywordResponseDto> {
    const keyword = await this.keywordDao.findById(id);

    // キーワードが見つからない場合はNotFoundExceptionをスロー
    if (!keyword) {
      throw new NotFoundException(`ID ${id} のキーワードが見つかりません`);
    }

    // KeywordエンティティをKeywordResponseDtoにマッピングして返却
    return this.mapToDto(keyword);
  }

  /**
   * Keywordエンティティ（親子関係含む）をKeywordResponseDtoにマッピングする
   * @param keyword Keywordエンティティ（親子関係含む）
   * @returns KeywordResponseDto
   */
  private mapToDto(keyword: KeywordWithRelations): KeywordResponseDto {
    // KeywordエンティティのプロパティをKeywordResponseDtoにマッピング
    const dto: KeywordResponseDto = {
      id: keyword.id,
      projectId: keyword.projectId,
      keywordName: keyword.keywordName,
      parentId: keyword.parentId,
      level: keyword.level,
      searchVolume: keyword.searchVolume,
      difficulty: keyword.difficulty ?? null,
      relevance: keyword.relevance ?? null,
      searchIntent: keyword.searchIntent ?? null,
      importance: keyword.importance ?? null,
      memo: keyword.memo ?? null,
      createdAt: keyword.createdAt,
      updatedAt: keyword.updatedAt,
      parentKeyword: keyword.parentKeyword
        ? this.mapToDto(keyword.parentKeyword as KeywordWithRelations)
        : null,
      childKeywords: keyword.childKeywords
        ? keyword.childKeywords.map((child) =>
            this.mapToDto(child as KeywordWithRelations),
          )
        : [],
    };

    return dto;
  }
}
