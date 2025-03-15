import { atom } from 'jotai';

// 見出しの階層構造の型定義
export interface HeadingItem {
  tag: string;
  text: string;
  children: HeadingItem[];
}

// スクレイピング結果の型定義
export interface ScrapingResultItem {
  id: string;
  url: string;          // current_url に対応
  title: string;
  content: string;      // description に対応
  index_status: string; // "index" または "noindex"
  internal_links: string[];
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
