import type { ArticleItem } from "~/atoms/articles";
import { ArticleCard } from "./ArticleCard";

interface ArticleListProps {
  articles: ArticleItem[];
  onSelectItem: (id: string) => void;
  isLoading: boolean;
}

export function ArticleList({ articles, onSelectItem, isLoading }: ArticleListProps) {
  if (articles.length === 0 && !isLoading) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">コンテンツがありません</h3>
        <p className="text-gray-500 dark:text-gray-400">
          スクレイピングを実行して、コンテンツを追加してください。
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map(item => (
        <ArticleCard
          key={item.id}
          item={item}
          onClick={() => onSelectItem(item.id)}
        />
      ))}
    </div>
  );
}
