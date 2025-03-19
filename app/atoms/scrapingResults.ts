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

// スクレイピング結果の型定義
export interface ScrapingResultItem {
  id: string;
  originalId?: number;  // DBから取得した元のID（number型）
  url: string;          // current_url に対応
  title: string;
  content: string;      // description に対応
  index_status: string; // "index" または "noindex"
  internal_links: InternalLinkItem[] | string[];  // 内部リンク（オブジェクトまたは文字列の配列）
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
