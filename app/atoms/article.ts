import { atom } from 'jotai';
import type { EditableArticleItem } from '~/types/article';

// 記事データを保持するatom
export const articlesAtom = atom<EditableArticleItem[]>([]);

// 現在編集中の項目のIDを保持するatom
export const editingArticleIdAtom = atom<string | null>(null);
