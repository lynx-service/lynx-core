// src/keyword/dao/keyword.dao.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/share/prisma/prisma.service';
import { Keyword, Prisma } from '@prisma/client';

@Injectable()
export class KeywordDao {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * キーワードを新規登録する
   * @param data キーワード作成データ
   * @returns 作成されたキーワード
   */
  async create(data: Prisma.KeywordCreateInput): Promise<Keyword> {
    return this.prisma.keyword.create({ data });
  }

  /**
   * IDでキーワードを検索する
   * @param id キーワードID
   * @returns キーワード、見つからない場合はnull
   */
  async findById(id: number): Promise<Keyword | null> {
    return this.prisma.keyword.findUnique({
      where: { id },
    });
  }

  /**
   * キーワードを更新する
   * @param id キーワードID
   * @param data 更新データ
   * @returns 更新されたキーワード
   */
  async update(id: number, data: Prisma.KeywordUpdateInput): Promise<Keyword> {
    return this.prisma.keyword.update({
      where: { id },
      data,
    });
  }

  /**
   * キーワードを削除する
   * @param id キーワードID
   * @returns 削除されたキーワード
   */
  async delete(id: number): Promise<Keyword> {
    return this.prisma.keyword.delete({
      where: { id },
    });
  }
}
