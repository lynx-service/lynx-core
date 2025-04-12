import { atom } from "jotai";
import { atomWithReset } from "jotai/utils";
import type { ArticleItem } from "~/types/article";

// 記事データを保持するatom
export const articlesAtom = atomWithReset<ArticleItem[]>([]);
