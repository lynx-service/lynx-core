import type { ArticleItem } from "~/atoms/articles";
import { ExternalLink } from "lucide-react";

interface ArticleInternalLinksProps {
  item: ArticleItem;
}

export function ArticleInternalLinks({ item }: ArticleInternalLinksProps) {
  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">内部リンク</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        {item.internal_links && item.internal_links.length > 0 ? (
          <ul className="space-y-2">
            {item.internal_links.map((link, index) => (
              <li key={index} className="flex items-start">
                <span className="text-gray-500 dark:text-gray-400 mr-2">{index + 1}.</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all"
                >
                  {link.url}
                  <ExternalLink className="ml-1 h-3 w-3 flex-shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">内部リンクはありません</p>
        )}
      </div>
    </div>
  );
}
