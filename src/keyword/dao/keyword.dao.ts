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
    // dataからparentIdを取得し、元のdataオブジェクトからは削除する
    // Prisma.KeywordCreateInputにはparentIdが含まれないため、anyキャストで対応
    // 本来はUsecase層などでparentIdを分離して渡すのが望ましい
    const { parentId, ...restData } = data as any;

    // Prismaに渡すデータを作成
    const createData: Prisma.KeywordCreateInput = {
      ...restData, // parentId以外のデータを展開
    };

    // parentIdが存在し、かつnullでない場合、parentKeywordリレーションを設定
    if (parentId !== null && parentId !== undefined) {
      createData.parentKeyword = {
        connect: { id: parentId },
      };
    }

    // Prisma Clientでキーワードを作成
    return this.prisma.keyword.create({ data: createData });
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
   * プロジェクトIDでキーワードを検索する
   * @param projectId プロジェクトID
   * @returns キーワードのリスト
   */
  async findByProjectId(projectId: number): Promise<Keyword[]> {
    // 指定されたプロジェクトIDに紐づくキーワードを検索
    return this.prisma.keyword.findMany({
      where: { projectId },
      // 必要に応じて関連データも取得する場合は include を追加
      // include: { project: true }
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
