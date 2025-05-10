import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticleDao } from '../dao/article.dao';
import { ProjectDao } from '../../project/dao/project.dao';
import { ArticleMinimalResponseDto } from '../dto/article-minimal-response.dto';

@Injectable()
export class ListMinimalArticlesByProjectUsecase {
  constructor(
    private readonly articleDao: ArticleDao,
    private readonly projectDao: ProjectDao,
  ) {}

  /**
   * 指定されたプロジェクトIDに紐づく記事の最小限の情報を一覧取得する
   * @param projectId プロジェクトID
   * @returns 記事の最小限の情報 (ArticleMinimalResponseDto) の配列
   * @throws NotFoundException プロジェクトが見つからない場合
   */
  async execute(projectId: number): Promise<ArticleMinimalResponseDto[]> {
    // 1. プロジェクトの存在確認
    const project = await this.projectDao.findById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    // 2. 記事の最小限の情報を取得
    const articles =
      await this.articleDao.findMinimalArticlesByProjectId(projectId);

    // 3. DTOにマッピングして返却
    return articles.map((article) => ({
      id: article.id,
      metaTitle: article.metaTitle || '',
      articleUrl: article.articleUrl,
      metaDescription: article.metaDescription || '',
      keywords: article.keywords.map((kwRelation) => kwRelation.keyword),
    }));
  }
}
