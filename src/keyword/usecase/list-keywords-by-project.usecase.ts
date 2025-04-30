// src/keyword/usecase/list-keywords-by-project.usecase.ts
import { Injectable } from '@nestjs/common';
import { KeywordDao, RawKeyword } from '../dao/keyword.dao'; // RawKeywordをインポート
import { KeywordResponseDto } from '../dto/keyword-response.dto';

// 階層構造を表す型
// DTOへのマッピングを容易にするため、プロパティ名はキャメルケースにする
type KeywordNode = {
  id: number;
  projectId: number;
  keywordName: string;
  parentId: number | null;
  level: number;
  searchVolume: number;
  difficulty: string | null;
  relevance: string | null;
  searchIntent: string | null;
  importance: string | null;
  memo: string | null;
  createdAt: Date;
  updatedAt: Date;
  parentKeyword: KeywordNode | null; // 親ノードへの参照（DTOマッピング用）
  childKeywords: KeywordNode[]; // 子ノードのリスト
};

@Injectable()
export class ListKeywordsByProjectUsecase {
  constructor(private readonly keywordDao: KeywordDao) {}

  /**
   * 指定されたプロジェクトIDに紐づくキーワードの一覧を階層構造で取得する
   * @param projectId プロジェクトID
   * @returns キーワードレスポンスDTOのリスト（階層構造）
   */
  async execute(projectId: number): Promise<KeywordResponseDto[]> {
    // DAOを呼び出してフラットなキーワードリスト（全階層）を取得
    const rawKeywords = await this.keywordDao.findByProjectId(projectId);

    // フラットなリストから階層構造（ツリー）を構築
    const keywordTree = this.buildKeywordTree(rawKeywords);

    // 構築したツリーのルートノードをDTOにマッピング
    // mapToDtoは再帰的に子もマッピングする
    return keywordTree.map((rootNode) => this.mapToDto(rootNode));
  }

  /**
   * フラットなRawKeywordリストから階層構造（KeywordNodeのツリー）を構築する
   * @param rawKeywords RawKeywordのフラットなリスト
   * @returns ルートノードのリスト
   */
  private buildKeywordTree(rawKeywords: RawKeyword[]): KeywordNode[] {
    const nodes = new Map<number, KeywordNode>();
    const rootNodes: KeywordNode[] = [];

    // 1. 全てのRawKeywordをKeywordNodeに変換し、Mapに格納
    rawKeywords.forEach((raw) => {
      const node: KeywordNode = {
        // RawKeywordのスネークケースをキャメルケースに変換
        id: raw.id,
        projectId: raw.project_id,
        keywordName: raw.keyword_name,
        parentId: raw.parent_id,
        level: raw.level,
        searchVolume: raw.search_volume,
        difficulty: raw.difficulty,
        relevance: raw.relevance,
        searchIntent: raw.search_intent,
        importance: raw.importance,
        memo: raw.memo,
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        parentKeyword: null, // 後で設定
        childKeywords: [], // 後で設定
      };
      nodes.set(node.id, node);
    });

    // 2. 各ノードの親子関係を構築
    nodes.forEach((node) => {
      if (node.parentId === null) {
        // 親がいないノードはルートノード
        rootNodes.push(node);
      } else {
        // 親がいる場合、親ノードを探してchildKeywordsに追加し、parentKeywordも設定
        const parent = nodes.get(node.parentId);
        if (parent) {
          parent.childKeywords.push(node);
          node.parentKeyword = parent; // 親への参照を設定
        } else {
          // 親が見つからない場合（データ不整合など）、ルートとして扱うかエラー処理
          console.warn(`Parent keyword with id ${node.parentId} not found for keyword ${node.id}. Treating as root.`);
          rootNodes.push(node);
        }
      }
    });

    // オプショナル: 子キーワードをID順などでソートする場合
    // nodes.forEach(node => {
    //   node.childKeywords.sort((a, b) => a.id - b.id);
    // });

    return rootNodes;
  }

  /**
   * KeywordNode（階層構造）をKeywordResponseDtoにマッピングする
   * @param node KeywordNode
   * @returns KeywordResponseDto
   */
  private mapToDto(node: KeywordNode): KeywordResponseDto {
    const dto: KeywordResponseDto = {
      id: node.id,
      projectId: node.projectId,
      keywordName: node.keywordName,
      parentId: node.parentId,
      level: node.level,
      searchVolume: node.searchVolume,
      difficulty: node.difficulty ?? null,
      relevance: node.relevance ?? null,
      searchIntent: node.searchIntent ?? null,
      importance: node.importance ?? null,
      memo: node.memo ?? null,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
      // 親キーワードのマッピング: buildKeywordTreeで設定された参照を使用
      // ただし、無限ループを避けるため、DTOの親はIDのみにするか、階層を制限するなどの考慮が必要
      // ここではシンプルにDTOの親はnullにしておくか、IDのみにするのが安全
      // parentKeyword: node.parentKeyword ? this.mapToDto(node.parentKeyword) : null, // 無限ループのリスク
      parentKeyword: null, // 安全のため一旦nullにする。必要なら別途取得戦略を検討。
      // 子キーワードを再帰的にマッピング
      childKeywords: node.childKeywords.map((child) => this.mapToDto(child)),
    };
    return dto;
  }
}
