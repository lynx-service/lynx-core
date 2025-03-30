import { atom } from "jotai";
import type { ArticleItem } from "~/types/article";

// 記事データを保持するatom
export const articlesAtom = atom<ArticleItem[]>([]);
