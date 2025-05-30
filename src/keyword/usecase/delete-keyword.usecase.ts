import { Injectable, NotFoundException } from '@nestjs/common';
import { KeywordDao } from '../dao/keyword.dao';
import { Keyword } from '@prisma/client';

@Injectable()
export class DeleteKeywordUsecase {
  constructor(private readonly keywordDao: KeywordDao) {}

  /**
   * キーワードを削除する
   * @param id キーワードID
   * @returns 削除されたキーワード
   * @throws NotFoundException キーワードが見つからない場合
   */
  async execute(id: number): Promise<Keyword> {
    // TODO：記事が紐づいている場合はリレーションを切断する処理を追加する
    // 削除対象のキーワードが存在するか確認
    const existingKeyword = await this.keywordDao.findById(id);
    if (!existingKeyword) {
      throw new NotFoundException(`ID ${id} のキーワードが見つかりません`);
    }
    return this.keywordDao.delete(id);
  }
}
