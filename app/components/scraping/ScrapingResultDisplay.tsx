import type { ArticleItem } from "~/types/article";
import { ScrapingResultBasicInfo } from "./ScrapingResultBasicInfo";
import { ScrapingResultHeadings } from "./ScrapingResultHeadings";
import { ScrapingResultInternalLinks } from "./ScrapingResultInternalLinks";
import { ScrapingResultOuterLinks } from "./ScrapingResultOuterLinks";
import { ScrapingResultJsonLd } from "./ScrapingResultJsonLd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

interface Props {
  item: ArticleItem;
}

export function ScrapingResultDisplay({ item }: Props) {
  // タブの表示条件を事前に計算
  const hasInternalLinks = item.internalLinks && item.internalLinks.length > 0;
  const hasOuterLinks = item.outerLinks && item.outerLinks.length > 0;
  const hasHeadings = item.headings && item.headings.length > 0;
  const hasJsonLd = item.jsonLd && item.jsonLd.length > 0;

  return (
    <div className="py-4">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto p-0 bg-transparent gap-1">
          <TabsTrigger 
            value="basic"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none"
          >
            基本情報
          </TabsTrigger>
          
          {hasInternalLinks && (
            <TabsTrigger 
              value="internal-links"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none"
            >
              内部リンク
            </TabsTrigger>
          )}
          
          {hasOuterLinks && (
            <TabsTrigger 
              value="outer-links"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none"
            >
              外部リンク
            </TabsTrigger>
          )}
          
          {hasHeadings && (
            <TabsTrigger 
              value="headings"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none"
            >
              見出し構造
            </TabsTrigger>
          )}
          
          {hasJsonLd && (
            <TabsTrigger 
              value="json-ld"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none"
            >
              構造化データ
            </TabsTrigger>
          )}
          
          <TabsTrigger 
            value="all-json"
            className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 dark:data-[state=active]:border-blue-400 rounded-none"
          >
            JSON
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="basic" className="m-0">
            <ScrapingResultBasicInfo item={item} />
          </TabsContent>
          
          {hasInternalLinks && (
            <TabsContent value="internal-links" className="m-0">
              <ScrapingResultInternalLinks item={item} />
            </TabsContent>
          )}
          
          {hasOuterLinks && (
            <TabsContent value="outer-links" className="m-0">
              <ScrapingResultOuterLinks item={item} />
            </TabsContent>
          )}
          
          {hasHeadings && (
            <TabsContent value="headings" className="m-0">
              <ScrapingResultHeadings item={item} />
            </TabsContent>
          )}
          
          {hasJsonLd && (
            <TabsContent value="json-ld" className="m-0">
              <ScrapingResultJsonLd item={item} />
            </TabsContent>
          )}
          
          <TabsContent value="all-json" className="m-0">
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">すべてのデータ（JSON）</h3>
              </div>
              <div className="p-4 bg-gray-100 dark:bg-gray-900 overflow-x-auto">
                <pre className="text-xs text-gray-800 dark:text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
