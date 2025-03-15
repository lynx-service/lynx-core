import type { EditableScrapingResultItem } from "~/atoms/scrapingResults";

interface Props {
  item: EditableScrapingResultItem;
}

export function ScrapingResultInternalLinks({ item }: Props) {
  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">内部リンク</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        <ul className="space-y-1 list-disc list-inside">
          {item.internal_links && item.internal_links.map((link, index) => (
            <li key={index} className="text-gray-700 dark:text-gray-300 break-all">
              <a 
                href={link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
