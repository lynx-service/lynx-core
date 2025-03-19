import type { EditableScrapingResultItem } from "~/atoms/scrapingResults";
import { ScrapingResultCard } from "./ScrapingResultCard";
import { ScrapingEmptyState } from "./ScrapingEmptyState";

interface ScrapingResultListProps {
  results: EditableScrapingResultItem[];
  onSelectItem: (id: string) => void;
  isLoading: boolean;
}

export function ScrapingResultList({ results, onSelectItem, isLoading }: ScrapingResultListProps) {
  if (results.length === 0 && !isLoading) {
    return <ScrapingEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map(item => (
        <ScrapingResultCard
          key={item.id}
          item={item}
          onClick={() => onSelectItem(item.id)}
        />
      ))}
    </div>
  );
}
