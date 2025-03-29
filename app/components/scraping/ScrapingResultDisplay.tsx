import type { ArticleItem } from "~/types/article";
import { ScrapingResultBasicInfo } from "./ScrapingResultBasicInfo";
import { ScrapingResultHeadings } from "./ScrapingResultHeadings";
import { ScrapingResultInternalLinks } from "./ScrapingResultInternalLinks";
import { ScrapingResultOuterLinks } from "./ScrapingResultOuterLinks";
import { ScrapingResultJsonLd } from "./ScrapingResultJsonLd";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { FileText, Link, ExternalLink, AlignLeft, Code, FileJson } from "lucide-react";

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
    <div className="py-2">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto p-1 bg-gray-100 dark:bg-gray-900/50 rounded-lg mb-6 overflow-x-auto">
          <TabsTrigger
            value="basic"
            className="flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">基本情報</span>
          </TabsTrigger>

          {hasInternalLinks && (
            <TabsTrigger
              value="internal-links"
              className="flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">内部リンク</span>
              <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                {item?.internalLinks?.length}
              </span>
            </TabsTrigger>
          )}

          {hasOuterLinks && (
            <TabsTrigger
              value="outer-links"
              className="flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">外部リンク</span>
              <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded-full">
                {item?.outerLinks?.length}
              </span>
            </TabsTrigger>
          )}

          {hasHeadings && (
            <TabsTrigger
              value="headings"
              className="flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              <AlignLeft className="h-4 w-4" />
              <span className="hidden sm:inline">見出し構造</span>
              <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                {item?.headings?.length}
              </span>
            </TabsTrigger>
          )}

          {hasJsonLd && (
            <TabsTrigger
              value="json-ld"
              className="flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
            >
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">構造化データ</span>
              <span className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded-full">
                {item?.jsonLd?.length}
              </span>
            </TabsTrigger>
          )}

          <TabsTrigger
            value="all-json"
            className="flex items-center gap-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm rounded-md transition-all duration-200"
          >
            <FileJson className="h-4 w-4" />
            <span className="hidden sm:inline">JSON</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-2 transition-all duration-300">
          <TabsContent value="basic" className="m-0 animate-in fade-in-50 duration-300">
            <ScrapingResultBasicInfo item={item} />
          </TabsContent>

          {hasInternalLinks && (
            <TabsContent value="internal-links" className="m-0 animate-in fade-in-50 duration-300">
              <ScrapingResultInternalLinks item={item} />
            </TabsContent>
          )}

          {hasOuterLinks && (
            <TabsContent value="outer-links" className="m-0 animate-in fade-in-50 duration-300">
              <ScrapingResultOuterLinks item={item} />
            </TabsContent>
          )}

          {hasHeadings && (
            <TabsContent value="headings" className="m-0 animate-in fade-in-50 duration-300">
              <ScrapingResultHeadings item={item} />
            </TabsContent>
          )}

          {hasJsonLd && (
            <TabsContent value="json-ld" className="m-0 animate-in fade-in-50 duration-300">
              <ScrapingResultJsonLd item={item} />
            </TabsContent>
          )}

          <TabsContent value="all-json" className="m-0 animate-in fade-in-50 duration-300">
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden shadow-sm">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  すべてのデータ（JSON）
                </h3>
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
