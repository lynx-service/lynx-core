import type { ArticleItem, HeadingItem } from "~/atoms/articles";

interface ArticleHeadingsProps {
  item: ArticleItem;
}

// 再帰的に見出しを表示するコンポーネント
function HeadingList({ headings, level = 0 }: { headings: HeadingItem[], level?: number }) {
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <ul className={`space-y-1 ${level > 0 ? 'ml-4 mt-1' : ''}`}>
      {headings.map((heading, index) => (
        <li key={index}>
          <div className={`flex items-start ${getHeadingColor(heading.tag)}`}>
            <span className="font-medium mr-2">{heading.tag}</span>
            <span>{heading.text}</span>
          </div>
          {heading.children && heading.children.length > 0 && (
            <HeadingList headings={heading.children} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

// 見出しレベルに応じた色を返す関数
function getHeadingColor(tag: string): string {
  switch (tag.toLowerCase()) {
    case 'h1':
      return 'text-blue-600 dark:text-blue-400';
    case 'h2':
      return 'text-indigo-600 dark:text-indigo-400';
    case 'h3':
      return 'text-purple-600 dark:text-purple-400';
    case 'h4':
      return 'text-pink-600 dark:text-pink-400';
    case 'h5':
      return 'text-red-600 dark:text-red-400';
    case 'h6':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
}

export function ArticleHeadings({ item }: ArticleHeadingsProps) {
  if (!item.headings || item.headings.length === 0) {
    return null;
  }

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">見出し構造</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        <HeadingList headings={item.headings} />
      </div>
    </div>
  );
}
