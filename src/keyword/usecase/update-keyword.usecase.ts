// src/keyword/usecase/update-keyword.usecase.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { KeywordDao } from '../dao/keyword.dao';
import { UpdateKeywordDto } from '../dto/update-keyword.dto';
import { Keyword, Prisma } from '@prisma/client';

@Injectable()
export class UpdateKeywordUsecase {
  constructor(private readonly keywordDao: KeywordDao) {}

  /**
   * キーワードを更新する
   * @param id キーワードID
   * @param updateKeywordDto キーワード更新DTO
   * @returns 更新されたキーワード
   * @throws NotFoundException キーワードが見つからない場合
   */
  async execute(
    id: number,
    updateKeywordDto: UpdateKeywordDto,
  ): Promise<Keyword> {
    // 更新対象のキーワードが存在するか確認
    const existingKeyword = await this.keywordDao.findById(id);
    if (!existingKeyword) {
      throw new NotFoundException(`ID ${id} のキーワードが見つかりません`);
    }

    // DTOからPrismaのUpdateInput型に変換
    const updateData: Prisma.KeywordUpdateInput = { ...updateKeywordDto };
    // projectIdやparentIdが更新データに含まれる場合、リレーションを更新
    // updateDataの型をPrisma.KeywordUpdateInputにしたので、dto由来のprojectId/parentIdを参照する
    if (updateKeywordDto.projectId) {
      updateData.project = { connect: { id: updateKeywordDto.projectId } };
    }
    if (updateKeywordDto.parentId) {
      updateData.parentKeyword = { connect: { id: updateKeywordDto.parentId } };
    } else if (
      updateKeywordDto.hasOwnProperty('parentId') &&
      updateKeywordDto.parentId === null // DTOでparentIdが明示的にnullで渡された場合
    ) {
      // parentIdがnullで渡された場合はリレーションを切断
      updateData.parentKeyword = { disconnect: true };
    }

    return this.keywordDao.update(id, updateData);
  }
}
