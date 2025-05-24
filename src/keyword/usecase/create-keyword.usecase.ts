import { Injectable } from '@nestjs/common';
import { KeywordDao } from '../dao/keyword.dao';
import { CreateKeywordDto } from '../dto/create-keyword.dto';
import { Keyword, Prisma } from '@prisma/client';

@Injectable()
export class CreateKeywordUsecase {
  constructor(private readonly keywordDao: KeywordDao) {}

  /**
   * キーワードを新規登録する
   * @param createKeywordDto キーワード作成DTO
   * @returns 作成されたキーワード
   */
  async execute(createKeywordDto: CreateKeywordDto): Promise<Keyword> {
    // CreateKeywordDto から Prisma.KeywordCreateInput 型のデータを作成
    const data: Prisma.KeywordCreateInput = {
      keywordName: createKeywordDto.keywordName,
      level: createKeywordDto.level,
      searchVolume: createKeywordDto.searchVolume,
      difficulty: createKeywordDto.difficulty,
      relevance: createKeywordDto.relevance,
      searchIntent: createKeywordDto.searchIntent,
      importance: createKeywordDto.importance,
      memo: createKeywordDto.memo,
      // プロジェクトIDでプロジェクトを紐付け
      project: {
        connect: { id: createKeywordDto.projectId },
      },
    };

    // parentId が存在する場合、parentKeywordリレーションを設定
    if (
      createKeywordDto.parentId !== null &&
      createKeywordDto.parentId !== undefined
    ) {
      data.parentKeyword = {
        connect: { id: createKeywordDto.parentId },
      };
    }

    return this.keywordDao.create(data);
  }
}
