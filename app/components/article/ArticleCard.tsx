import type { ArticleItem } from "~/atoms/articles";

interface ArticleCardProps {
  item: ArticleItem;
  onClick: () => void;
}

export function ArticleCard({ item, onClick }: ArticleCardProps) {
  return (
    <div
      className="h-full flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 cursor-pointer"
      onClick={onClick}
    >
      {/* コンテンツ部分 */}
      <div className="flex-grow p-6 dark:bg-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {item.title || "タイトルなし"}
        </h2>

        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-3 block truncate"
          onClick={(e) => e.stopPropagation()} // カード全体のクリックイベントを防止
        >
          {item.url}
        </a>

        <div className="mt-3 text-gray-600 dark:text-gray-300 text-sm line-clamp-4 h-20 overflow-hidden">
          {item.content || "コンテンツなし"}
        </div>
      </div>

      {/* フッター部分（常に最下部） */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-between mt-auto">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            item.index_status === "index"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          {item.index_status === "index" ? "インデックス" : "ノーインデックス"}
        </span>

        <span className="text-xs text-gray-500 dark:text-gray-400">
          {item.internal_links.length} リンク
        </span>
      </div>
    </div>
  );
}
