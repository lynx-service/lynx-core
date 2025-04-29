// src/keyword/usecase/create-keyword.usecase.ts
import { Injectable } from '@nestjs/common';
import { KeywordDao } from '../dao/keyword.dao';
import { CreateKeywordDto } from '../dto/create-keyword.dto';
import { Keyword } from '@prisma/client';

@Injectable()
export class CreateKeywordUsecase {
  constructor(private readonly keywordDao: KeywordDao) {}

  /**
   * キーワードを新規登録する
   * @param createKeywordDto キーワード作成DTO
   * @returns 作成されたキーワード
   */
  async execute(createKeywordDto: CreateKeywordDto): Promise<Keyword> {
    // DTOからPrismaのCreateInput型に変換
    // projectリレーションを接続するためにconnectを使用
    const createData = {
      ...createKeywordDto,
      project: {
        connect: { id: createKeywordDto.projectId },
      },
      // parentIdが存在する場合のみ、parentKeywordリレーションを接続
      ...(createKeywordDto.parentId && {
        parentKeyword: {
          connect: { id: createKeywordDto.parentId },
        },
      }),
    };
    // projectIdはリレーションで使用するため不要なので削除
    delete createData.projectId;
    // parentIdはリレーションで使用するため不要なので削除
    if (createData.parentId) {
      delete createData.parentId;
    }

    return this.keywordDao.create(createData);
  }
}
