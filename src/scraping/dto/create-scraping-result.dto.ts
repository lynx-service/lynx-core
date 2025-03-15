export interface HeadingItem {
  id: string;
  text: string;
  level: number;
  tag?: string; // h1, h2, h3, h4
  children?: HeadingItem[];
}

export class ScrapyingResultItem {
  id: string;
  url: string;
  title: string;
  content: string;
  index_status: 'index' | 'noindex';
  internal_links: string[];
  headings: HeadingItem[];
}

export class CreateScrapingResultDto {
  userId: number;
  scrapyingResultItems: ScrapyingResultItem[];
}
