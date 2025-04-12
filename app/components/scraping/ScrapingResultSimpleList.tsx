import type { SimpleScrapingResultItem } from "~/atoms/scrapingResults";
import { ScrapingResultSimpleCard } from "./ScrapingResultSimpleCard";
import { ScrapingEmptyState } from "./ScrapingEmptyState";

interface ScrapingResultSimpleListProps {
  results: SimpleScrapingResultItem[];
  onSelectItem: (id: string) => void;
  isLoading: boolean;
}

export function ScrapingResultSimpleList({ results, onSelectItem, isLoading }: ScrapingResultSimpleListProps) {
  if (results.length === 0 && !isLoading) {
    return <ScrapingEmptyState />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map(item => (
        <ScrapingResultSimpleCard
          key={item.id}
          item={item}
          onClick={() => onSelectItem(item.id)}
        />
      ))}
    </div>
  );
}
