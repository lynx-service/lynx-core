// src/keyword/dao/keyword.dao.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/share/prisma/prisma.service';
import { Keyword, Prisma } from '@prisma/client';

// 再帰クエリの結果を受け取るための型
export type RawKeyword = {
  id: number;
  project_id: number; // SQLクエリの結果はスネークケースになるため合わせる
  keyword_name: string;
  parent_id: number | null;
  level: number;
  search_volume: number;
  difficulty: string | null;
  relevance: string | null;
  search_intent: string | null;
  importance: string | null;
  memo: string | null;
  created_at: Date;
  updated_at: Date;
};

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
   * @returns キーワード（親子関係含む）、見つからない場合はnull
   */
  async findById(
    id: number,
  ): Promise<
    Keyword & { parentKeyword: Keyword | null; childKeywords: Keyword[] } | null
  > {
    // 親と直接の子キーワードを含めて検索
    return this.prisma.keyword.findUnique({
      where: { id },
      include: {
        parentKeyword: true, // 親キーワードを取得
        childKeywords: true, // 直接の子キーワードを取得
      },
    });
  }

  /**
   * プロジェクトIDでキーワードを検索する（全階層）
   * @param projectId プロジェクトID
   * @returns キーワードのフラットなリスト（全階層）
   */
  async findByProjectId(projectId: number): Promise<RawKeyword[]> {
    // WITH RECURSIVE を使用して、指定されたプロジェクトの全階層のキーワードを取得
    // カラム名は RawKeyword 型に合わせてスネークケースで取得
    const query = Prisma.sql`
      WITH RECURSIVE keyword_hierarchy AS (
        -- ベースケース: 指定されたプロジェクトのトップレベルキーワード (parent_id IS NULL)
        SELECT
          id, project_id, keyword_name, parent_id, level, search_volume,
          difficulty, relevance, search_intent, importance, memo, created_at, updated_at
        FROM keyword
        WHERE project_id = ${projectId} AND parent_id IS NULL

        UNION ALL

        -- 再帰ステップ: 親に紐づく子を検索
        SELECT
          k.id, k.project_id, k.keyword_name, k.parent_id, k.level, k.search_volume,
          k.difficulty, k.relevance, k.search_intent, k.importance, k.memo, k.created_at, k.updated_at
        FROM keyword k
        INNER JOIN keyword_hierarchy kh ON k.parent_id = kh.id
        WHERE k.project_id = ${projectId} -- プロジェクトIDで絞り込み
      )
      -- 結果を選択（必要に応じて ORDER BY などを追加）
      SELECT * FROM keyword_hierarchy;
    `;

    // Prisma.$queryRaw を使用してSQLを実行し、結果を RawKeyword[] 型として返す
    // SQLインジェクションを防ぐため、パラメータは Prisma.sql タグ付きテンプレートリテラルを使用
    return this.prisma.$queryRaw<RawKeyword[]>(query);
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
