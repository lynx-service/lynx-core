import { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ScrapingResultDao } from '../../scraping/dao/scraping-result.dao';
import { KeywordArticleDao } from '../dao/keyword-article.dao';
import { KeywordResponseDto } from '../../keyword/dto/keyword-response.dto'; // DTOをインポート
import { Keyword } from '@prisma/client';

// DAOから取得するKeywordの型を定義（親子関係を含む）
type KeywordWithRelations = Keyword & {
  parentKeyword: Keyword | null;
  childKeywords: Keyword[];
};

// DAOから取得するKeywordArticleの型を定義（関連キーワードの親子関係含む）
type KeywordArticleWithRelations = Prisma.KeywordArticleGetPayload<{
  include: {
    keyword: {
      include: {
        parentKeyword: true;
        childKeywords: true;
      };
    };
  };
}>;

@Injectable()
export class ListKeywordsByArticleUsecase {
  constructor(
    private readonly scrapingResultDao: ScrapingResultDao,
    private readonly keywordArticleDao: KeywordArticleDao,
  ) {}

  /**
   * 指定された記事IDに紐づくキーワードの一覧を取得する
   * @param articleId - 記事ID
   * @throws NotFoundException - 記事が見つからない場合
   * @returns キーワードレスポンスDTO (KeywordResponseDto) の配列
   */
  async execute(articleId: number): Promise<KeywordResponseDto[]> {
    // 1. 記事の存在確認 (ScrapingResultDaoはArticleの取得に使われていると仮定)
    // TODO: ArticleDao を使うようにリファクタリング検討
    const articleExists = await this.scrapingResultDao.findById(articleId);
    if (!articleExists) {
      throw new NotFoundException(`記事ID ${articleId} が見つかりません。`);
    }

    // 2. 記事IDに紐づく関連付けを取得 (関連キーワードの親子関係含む)
    const keywordArticles =
      await this.keywordArticleDao.findByArticleId(articleId);

    // 3. 関連付けからキーワード情報を抽出し、DTOにマッピングして返す
    return keywordArticles.map((ka) =>
      this.mapToDto(ka.keyword as KeywordWithRelations), // 型アサーションが必要
    );
  }

  /**
   * Keywordエンティティ（親子関係含む）をKeywordResponseDtoにマッピングする
   * （他のUsecaseと同様のロジック）
   * @param keyword Keywordエンティティ（親子関係含む）
   * @returns KeywordResponseDto
   */
  private mapToDto(keyword: KeywordWithRelations): KeywordResponseDto {
    const dto: KeywordResponseDto = {
      id: keyword.id,
      projectId: keyword.projectId,
      keywordName: keyword.keywordName,
      parentId: keyword.parentId,
      level: keyword.level,
      searchVolume: keyword.searchVolume,
      difficulty: keyword.difficulty ?? null,
      relevance: keyword.relevance ?? null,
      searchIntent: keyword.searchIntent ?? null,
      importance: keyword.importance ?? null,
      memo: keyword.memo ?? null,
      createdAt: keyword.createdAt,
      updatedAt: keyword.updatedAt,
      parentKeyword: keyword.parentKeyword
        ? this.mapToDto(keyword.parentKeyword as KeywordWithRelations)
        : null,
      childKeywords: keyword.childKeywords
        ? keyword.childKeywords.map((child) =>
            this.mapToDto(child as KeywordWithRelations),
          )
        : [],
    };
    return dto;
  }
}
