// src/keyword/usecase/get-keyword.usecase.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { KeywordDao } from '../dao/keyword.dao';
import { KeywordResponseDto } from '../dto/keyword-response.dto';
import { Keyword } from '@prisma/client';

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
    // DAOを使用してキーワードを検索
    const keyword = await this.keywordDao.findById(id);

    // キーワードが見つからない場合はNotFoundExceptionをスロー
    if (!keyword) {
      throw new NotFoundException(`ID ${id} のキーワードが見つかりません`);
    }

    // KeywordエンティティをKeywordResponseDtoにマッピングして返却
    return this.mapToDto(keyword);
  }

  /**
   * KeywordエンティティをKeywordResponseDtoにマッピングする
   * @param keyword Keywordエンティティ
   * @returns KeywordResponseDto
   */
  private mapToDto(keyword: Keyword): KeywordResponseDto {
    // Keywordエンティティの全プロパティをKeywordResponseDtoにマッピングする
    return {
      id: keyword.id,
      projectId: keyword.projectId,
      keywordName: keyword.keywordName, // 'name' から 'keywordName' に修正
      parentId: keyword.parentId,
      level: keyword.level,
      searchVolume: keyword.searchVolume,
      difficulty: keyword.difficulty,
      relevance: keyword.relevance,
      searchIntent: keyword.searchIntent,
      importance: keyword.importance,
      memo: keyword.memo,
      createdAt: keyword.createdAt,
      updatedAt: keyword.updatedAt,
    };
  }
}
