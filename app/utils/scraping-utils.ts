import type { EditableScrapingResultItem, HeadingItem, InternalLinkItem } from "~/atoms/scrapingResults";

// DBから取得するデータの型定義
export interface ScrapingArticle {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  articleUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isIndexable: boolean | null;
}

export interface InnerLink {
  id?: number;
  linkedArticle: ScrapingArticle;
  linkUrl: string;
}

export interface DBHeadingItem {
  id?: number;
  tag: string;
  text: string;
  children: DBHeadingItem[];
}

export interface ScrapingResult {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  projectId: number;
  articleUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isIndexable: boolean | null;
  innerLinks: InnerLink[];
  headings: DBHeadingItem[];
}

// 見出しの階層構造を処理する関数
export function processHeadings(headings: DBHeadingItem[]): HeadingItem[] {
  return headings.map(heading => ({
    id: heading.id,
    tag: heading.tag || "",
    text: heading.text || "",
    children: heading.children ? processHeadings(heading.children) : []
  }));
}

// DBのデータをEditableScrapingResultItem形式に変換する関数
export function convertToEditableItem(item: ScrapingResult): EditableScrapingResultItem {
  // 内部リンクを処理
  const internalLinks: InternalLinkItem[] = item.innerLinks?.map(link => ({
    id: link.id,
    url: link.linkUrl
  })) || [];

  return {
    id: item.id.toString(),
    originalId: item.id,
    url: item.articleUrl || "",
    title: item.metaTitle || "",
    content: item.metaDescription || "",
    index_status: item.isIndexable ? "index" : "noindex",
    internal_links: internalLinks,
    headings: item.headings ? processHeadings(item.headings) : [],
    isEditing: false
  };
}

// 内部リンクのURLを取得する関数
export function getInternalLinkUrl(link: string | InternalLinkItem): string {
  return typeof link === 'string' ? link : link.url;
}

// 内部リンクの数を取得する関数
export function getInternalLinksCount(item: EditableScrapingResultItem): number {
  if (!item.internal_links) return 0;
  return item.internal_links.length;
}

// 見出しの更新（再帰的）
export function updateHeadingRecursive(
  headings: HeadingItem[], 
  path: number[], 
  field: keyof HeadingItem, 
  value: string
): HeadingItem[] {
  if (path.length === 0) return headings;

  const index = path[0];
  const newHeadings = [...headings];

  if (path.length === 1) {
    newHeadings[index] = { ...newHeadings[index], [field]: value };
  } else {
    const newPath = path.slice(1);
    if (newHeadings[index].children) {
      newHeadings[index] = {
        ...newHeadings[index],
        children: updateHeadingRecursive(newHeadings[index].children || [], newPath, field, value)
      };
    }
  }

  return newHeadings;
}
