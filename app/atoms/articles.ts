import { atom } from 'jotai';

// 見出しの階層構造の型定義
export interface HeadingItem {
  id?: number;  // 見出しのID（DBから取得した場合に存在）
  tag: string;
  text: string;
  children: HeadingItem[];
}

// 内部リンクの型定義
export interface InternalLinkItem {
  id?: number;  // 内部リンクのID（DBから取得した場合に存在）
  url: string;  // リンク先のURL
}

// 記事の型定義
export interface ArticleItem {
  id: string;
  originalId?: number;  // DBから取得した元のID（number型）
  url: string;          // current_url に対応
  title: string;
  content: string;      // description に対応
  index_status: string; // "index" または "noindex"
  internal_links: InternalLinkItem[];  // 内部リンク
  headings: HeadingItem[];
  isEditing: boolean;
}

// 記事データを保持するatom
export const articlesAtom = atom<ArticleItem[]>([]);

// 現在編集中の記事IDを保持するatom
export const editingArticleIdAtom = atom<string | null>(null);
