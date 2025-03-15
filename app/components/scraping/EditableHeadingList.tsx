import type { HeadingItem } from "~/atoms/scrapingResults";
import { Input } from "~/components/ui/input";
import { useCallback } from "react";

interface Props {
  headings: HeadingItem[];
  path: number[];
  onUpdate: (path: number[], field: keyof HeadingItem, value: string) => void;
}

export function EditableHeadingList({ headings, path, onUpdate }: Props) {

  const renderEditableHeadings = useCallback((headings: HeadingItem[], path: number[], onUpdate: (path: number[], field: keyof HeadingItem, value: string) => void) => {
    return (
      <ul className="space-y-1 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
        {headings.map((heading, index) => (
          <li key={index} className="text-gray-700 dark:text-gray-300 space-y-2">
            <div className="flex items-start space-x-2 space-y-2">
              <span className={`inline-block min-w-[40px] font-medium ${heading.tag === 'h1' ? 'text-lg text-emerald-600 dark:text-emerald-400' :
                  heading.tag === 'h2' ? 'text-base text-blue-600 dark:text-blue-400' :
                    heading.tag === 'h3' ? 'text-sm text-indigo-600 dark:text-indigo-400' :
                      'text-xs text-purple-600 dark:text-purple-400'
                }`}>
                {heading.tag}:
              </span>
              <Input
                value={heading.text || ""}
                onChange={(e) => onUpdate([...path, index], 'text', e.target.value)}
                className="flex-1 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            {heading.children && heading.children.length > 0 && (
              <EditableHeadingList
                headings={heading.children}
                path={[...path, index]}
                onUpdate={onUpdate}
              />
            )}
          </li>
        ))}
      </ul>
    );
  }, []);

  return renderEditableHeadings(headings, path, onUpdate);
}
