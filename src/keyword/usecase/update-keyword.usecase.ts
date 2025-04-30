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

    // DTOからリレーションキーを除外し、残りをupdateDataにコピー
    const { parentId, projectId, ...restDto } = updateKeywordDto;
    const updateData: Prisma.KeywordUpdateInput = { ...restDto };

    // projectId が DTO に存在する場合、project リレーションを設定
    // projectId が undefined でないことを確認
    if (projectId !== undefined) {
      updateData.project = { connect: { id: projectId } };
    }

    // parentId が DTO に存在する場合（nullを含む）、parentKeyword リレーションを設定
    // DTOに 'parentId' プロパティが存在するかどうかを確認
    if (updateKeywordDto.hasOwnProperty('parentId')) {
      if (parentId !== null && parentId !== undefined) {
        // parentId が指定されている (null/undefined以外) 場合は接続
        updateData.parentKeyword = { connect: { id: parentId } };
      } else {
        // parentId が null または undefined の場合は切断
        // DTOで明示的にnullが渡された場合、またはプロパティが存在しない場合にリレーションを切断する
        updateData.parentKeyword = { disconnect: true };
      }
    }
    // 注意: DTOに parentId プロパティが含まれていない場合は、parentKeyword は更新されません。

    // DAOのupdateメソッドを呼び出し (updateDataにはparentIdは含まれない)
    return this.keywordDao.update(id, updateData);
  }
}
