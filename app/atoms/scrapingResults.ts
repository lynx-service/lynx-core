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

// スクレイピング結果の簡略型定義（新しいコンポーネント用）
export interface SimpleScrapingResultItem {
  id: string;
  url: string;
  title: string;
  content: string;
  index_status: string;
  internal_links_count: number;
  headings_count: number;
}

// 既存の型定義（互換性のために残す）
export interface ScrapingResultItem {
  id: string;
  originalId?: number;
  url: string;
  title: string;
  content: string;
  index_status: string;
  internal_links: InternalLinkItem[] | string[];
  headings: HeadingItem[];
}

// 編集可能なスクレイピング結果の型
export interface EditableScrapingResultItem extends ScrapingResultItem {
  isEditing: boolean;
}

// スクレイピング結果を保持するatom
export const scrapingResultsAtom = atom<EditableScrapingResultItem[]>([]);

// 現在編集中の項目のIDを保持するatom
export const editingItemIdAtom = atom<string | null>(null);

// 簡略化されたスクレイピング結果を保持するatom
export const simpleScrapingResultsAtom = atom<SimpleScrapingResultItem[]>([]);
