// src/keyword/usecase/list-keywords-by-project.usecase.ts
import { Injectable } from '@nestjs/common';
import { KeywordDao } from '../dao/keyword.dao';
import { Keyword } from '@prisma/client';

@Injectable()
export class ListKeywordsByProjectUsecase {
  constructor(private readonly keywordDao: KeywordDao) {}

  /**
   * 指定されたプロジェクトIDに紐づくキーワードの一覧を取得する
   * @param projectId プロジェクトID
   * @returns キーワードのリスト
   */
  async execute(projectId: number): Promise<Keyword[]> {
    // DAOを呼び出してキーワードリストを取得
    return this.keywordDao.findByProjectId(projectId);
  }
}
