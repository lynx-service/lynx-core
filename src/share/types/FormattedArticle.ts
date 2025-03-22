/**
 * リンクステータス情報の型定義
 */
export interface LinkStatus {
  /** HTTPステータスコード */
  code: number;
  /** リダイレクト先URL（リダイレクトの場合のみ） */
  redirectUrl: string;
}

/**
 * 内部リンク情報の型定義
 */
export interface InternalLink {
  /** リンクのURL */
  linkUrl: string;
  /** アンカーテキスト */
  anchorText: string;
  /** フォローリンクかどうか */
  isFollow: boolean;
  /** リンクのステータス情報 */
  status: LinkStatus;
}

/**
 * 外部リンク情報の型定義
 */
export interface OuterLink {
  /** リンクのURL */
  linkUrl: string;
  /** アンカーテキスト */
  anchorText: string;
  /** フォローリンクかどうか */
  isFollow: boolean;
  /** リンクのステータス情報 */
  status: LinkStatus;
}

/**
 * 見出し情報の型定義（再帰的な構造）
 */
export interface Heading {
  /** 見出しタグ (h1, h2, h3, ...) */
  tag: string;
  /** 見出しのテキスト */
  text: string;
  /** 子見出し */
  children: Heading[];
}

/**
 * JSON-LDデータの型定義
 * フロントエンドから渡されるデータ構造に合わせて定義
 */
export type JsonLd = any;

/**
 * キーワード情報の型定義
 */
export interface Keyword {
  /** キーワードID */
  id: number;
  /** キーワード名 */
  name: string;
  /** 検索ボリューム */
  searchVolume: number;
  /** クリック単価 */
  cpc?: number;
}

/**
 * フロントエンドに渡す記事データの型定義
 */
export interface FormattedArticle {
  /** 記事ID */
  id: number;
  /** プロジェクトID */
  projectId: number;
  /** 記事のURL */
  articleUrl: string;
  /** メタタイトル */
  metaTitle: string;
  /** メタディスクリプション */
  metaDescription: string;
  /** インデックス可能かどうか */
  isIndexable: boolean;
  /** 内部リンク */
  internalLinks: InternalLink[];
  /** 外部リンク */
  outerLinks: OuterLink[];
  /** 記事の見出し構造 */
  headings: Heading[];
  /** JSON-LDデータ */
  jsonLd?: JsonLd[];
  /** 関連キーワード */
  keywords?: Keyword[];
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}

/**
 * 記事リスト用の簡易記事データの型定義
 */
export interface ArticleSummary {
  /** 記事ID */
  id: number;
  /** 記事のURL */
  articleUrl: string;
  /** メタタイトル */
  metaTitle: string;
  /** メタディスクリプション */
  metaDescription: string;
  /** インデックス可能かどうか */
  isIndexable: boolean;
  /** 関連キーワード数 */
  keywordCount: number;
  /** 内部リンク数 */
  internalLinkCount: number;
  /** 外部リンク数 */
  outerLinkCount: number;
  /** 作成日時 */
  createdAt: string;
  /** 更新日時 */
  updatedAt: string;
}

/**
 * フロントエンドから送信される記事データの型定義
 */
export interface ArticleInput {
  /** 記事のURL */
  articleUrl: string;
  /** メタタイトル */
  metaTitle: string;
  /** メタディスクリプション */
  metaDescription: string;
  /** インデックス可能かどうか */
  isIndexable: boolean;
  /** 内部リンク */
  internalLinks: InternalLink[];
  /** 外部リンク */
  outerLinks: OuterLink[];
  /** 記事の見出し構造 */
  headings: Heading[];
  /** JSON-LDデータ */
  jsonLd?: JsonLd[];
}

/**
 * フロントエンドから送信されるスクレイピング結果の型定義
 */
export interface ScrapingResultInput {
  /** プロジェクトID */
  projectId: number;
  /** 記事データの配列 */
  articles: ArticleInput[];
}
