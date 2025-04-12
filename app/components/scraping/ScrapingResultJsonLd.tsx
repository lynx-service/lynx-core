import type { ArticleItem } from "~/types/article";
import React, { useState } from "react";
import { ChevronDown, ChevronUp, Building, Globe, FileText, BookOpen, List, User, ShoppingBag, HelpCircle, FileQuestion, Calendar, ExternalLink, Code } from "lucide-react";

interface Props {
  item: ArticleItem;
}

/**
 * 構造化データ（JSON-LD）を表示するコンポーネント
 * JSON-LDの配列を受け取り、各アイテムを展開して表示する
 */
export function ScrapingResultJsonLd({ item }: Props) {
  // JSON-LDデータがない場合は何も表示しない
  if (!item.jsonLd || item.jsonLd.length === 0) {
    return null;
  }

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex items-center">
        <Code className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">構造化データ（JSON-LD）</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        <div className="space-y-6">
          {item.jsonLd.map((jsonLdItem, index) => (
            <JsonLdItem key={index} data={jsonLdItem} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

// JSON-LDアイテムを表示するコンポーネント
function JsonLdItem({ data, index }: { data: any, index: number }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'summary' | 'json'>('summary');
  
  // @graphがある場合はその内容を表示
  const hasGraph = data["@graph"] && Array.isArray(data["@graph"]) && data["@graph"].length > 0;
  
  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div 
        className="bg-gray-100 dark:bg-gray-900 px-4 py-3 flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            構造化データ #{index + 1}
          </span>
          {hasGraph && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
              {data["@graph"].length}アイテム
            </span>
          )}
        </div>
        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="border-t dark:border-gray-700">
          {/* タブナビゲーション */}
          <div className="flex border-b dark:border-gray-700">
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'summary'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('summary')}
            >
              概要表示
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === 'json'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400'
              }`}
              onClick={() => setActiveTab('json')}
            >
              JSON表示
            </button>
          </div>
          
          {/* タブコンテンツ */}
          <div className="p-4 bg-white dark:bg-gray-800">
            {activeTab === 'summary' ? (
              hasGraph ? (
                <GraphItemsDisplay items={data["@graph"]} />
              ) : (
                <SingleItemDisplay item={data} />
              )
            ) : (
              <div className="overflow-x-auto">
                <pre className="text-xs text-gray-800 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-900 p-3 rounded border dark:border-gray-700">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// @graphアイテムの表示
function GraphItemsDisplay({ items }: { items: any[] }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((item, index) => {
          const type = Array.isArray(item["@type"]) ? item["@type"][0] : item["@type"];
          const { color, bgColor, icon: Icon } = getTypeInfo(type);
          
          return (
            <div key={index} className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <div className={`px-3 py-2 ${bgColor} flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Icon size={16} className={color} />
                  <h5 className={`text-sm font-medium ${color}`}>{type}</h5>
                </div>
                {item["@id"] && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] break-all overflow-wrap-anywhere" title={item["@id"]}>
                    ID: {item["@id"]}
                  </span>
                )}
              </div>
              <div className="p-3 bg-white dark:bg-gray-800">
                <JsonLdTypeDisplay item={item} type={type} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 単一のJSON-LDアイテムの表示
function SingleItemDisplay({ item }: { item: any }) {
  const type = Array.isArray(item["@type"]) ? item["@type"][0] : item["@type"];
  const { color, bgColor, icon: Icon } = getTypeInfo(type);
  
  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className={`px-3 py-2 ${bgColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Icon size={16} className={color} />
          <h5 className={`text-sm font-medium ${color}`}>{type || "Unknown"}</h5>
        </div>
        {item["@id"] && (
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] break-all overflow-wrap-anywhere" title={item["@id"]}>
            ID: {item["@id"]}
          </span>
        )}
      </div>
      <div className="p-3 bg-white dark:bg-gray-800">
        <JsonLdTypeDisplay item={item} type={type} />
      </div>
    </div>
  );
}

// 各タイプの構造化データに対応する表示コンポーネント
function JsonLdTypeDisplay({ item, type }: { item: any, type: string }) {
  switch (type) {
    case "Organization":
      return <OrganizationDisplay data={item} />;
    case "WebSite":
      return <WebSiteDisplay data={item} />;
    case "WebPage":
      return <WebPageDisplay data={item} />;
    case "Article":
      return <ArticleDisplay data={item} />;
    case "BreadcrumbList":
      return <BreadcrumbListDisplay data={item} />;
    case "Person":
      return <PersonDisplay data={item} />;
    case "Product":
      return <ProductDisplay data={item} />;
    case "FAQPage":
      return <FAQPageDisplay data={item} />;
    case "HowTo":
      return <HowToDisplay data={item} />;
    default:
      return <GenericDisplay data={item} />;
  }
}

// 組織情報の表示
function OrganizationDisplay({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      {data.name && (
        <PropertyItem label="name" value={data.name} />
      )}
      
      {data.url && (
        <PropertyItem 
          label="url" 
          value={
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all overflow-wrap-anywhere">
              <span className="break-all overflow-wrap-anywhere">{data.url}</span>
              <ExternalLink size={12} className="ml-1 flex-shrink-0" />
            </a>
          } 
        />
      )}
      
      {data.logo && (
        <div>
          <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">logo</h6>
          <div className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
            {data.logo["@type"] && <PropertyItem label="@type" value={data.logo["@type"]} />}
            {data.logo.url && (
              <PropertyItem 
                label="url" 
                value={
                  <div className="flex flex-col">
                    <a href={data.logo.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all overflow-wrap-anywhere">
                      <span className="break-all overflow-wrap-anywhere">{data.logo.url}</span>
                      <ExternalLink size={12} className="ml-1 flex-shrink-0" />
                    </a>
                    <img 
                      src={data.logo.url} 
                      alt="Logo" 
                      className="mt-2 max-h-16 object-contain border dark:border-gray-700 rounded p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                } 
              />
            )}
            {data.logo.width && <PropertyItem label="width" value={data.logo.width} />}
            {data.logo.height && <PropertyItem label="height" value={data.logo.height} />}
          </div>
        </div>
      )}
      
      {data.founder && (
        <div>
          <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">founder</h6>
          <div className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
            {data.founder["@type"] && <PropertyItem label="@type" value={data.founder["@type"]} />}
            {data.founder.name && <PropertyItem label="name" value={data.founder.name} />}
            {data.founder.url && (
              <PropertyItem 
                label="url" 
                value={
                  <a href={data.founder.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all overflow-wrap-anywhere">
                    <span className="break-all overflow-wrap-anywhere">{data.founder.url}</span>
                    <ExternalLink size={12} className="ml-1 flex-shrink-0" />
                  </a>
                } 
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Webサイト情報の表示
function WebSiteDisplay({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      {data.name && (
        <PropertyItem label="name" value={data.name} />
      )}
      
      {data.url && (
        <PropertyItem 
          label="url" 
          value={
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all overflow-wrap-anywhere">
              <span className="break-all overflow-wrap-anywhere">{data.url}</span>
              <ExternalLink size={12} className="ml-1 flex-shrink-0" />
            </a>
          } 
        />
      )}
    </div>
  );
}

// Webページ情報の表示
function WebPageDisplay({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      {data.name && (
        <PropertyItem label="name" value={data.name} />
      )}
      
      {data.url && (
        <PropertyItem 
          label="url" 
          value={
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all overflow-wrap-anywhere">
              <span className="break-all overflow-wrap-anywhere">{data.url}</span>
              <ExternalLink size={12} className="ml-1 flex-shrink-0" />
            </a>
          } 
        />
      )}
      
      {data.description && (
        <PropertyItem label="description" value={data.description} />
      )}
      
      {data.isPartOf && data.isPartOf["@id"] && (
        <PropertyItem label="isPartOf" value={data.isPartOf["@id"]} />
      )}
    </div>
  );
}

// 記事情報の表示
function ArticleDisplay({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      {data.headline && (
        <PropertyItem label="headline" value={data.headline} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.datePublished && (
          <PropertyItem 
            label="datePublished" 
            value={
              <div className="flex items-center">
                <Calendar size={14} className="mr-1 text-gray-500 dark:text-gray-400" />
                {formatDate(data.datePublished)}
              </div>
            } 
          />
        )}
        
        {data.dateModified && (
          <PropertyItem 
            label="dateModified" 
            value={
              <div className="flex items-center">
                <Calendar size={14} className="mr-1 text-gray-500 dark:text-gray-400" />
                {formatDate(data.dateModified)}
              </div>
            } 
          />
        )}
      </div>
      
      {data.author && (
        <div>
          <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">author</h6>
          <div className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
            {data.author["@type"] && <PropertyItem label="@type" value={data.author["@type"]} />}
            {data.author.name && <PropertyItem label="name" value={data.author.name} />}
            {data.author.url && (
              <PropertyItem 
                label="url" 
                value={
                  <a href={data.author.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all overflow-wrap-anywhere">
                    <span className="break-all overflow-wrap-anywhere">{data.author.url}</span>
                    <ExternalLink size={12} className="ml-1 flex-shrink-0" />
                  </a>
                } 
              />
            )}
            {data.author.jobTitle && <PropertyItem label="jobTitle" value={data.author.jobTitle} />}
          </div>
        </div>
      )}
      
      {data.publisher && data.publisher["@id"] && (
        <PropertyItem label="publisher" value={data.publisher["@id"]} />
      )}
      
      {data.image && data.image.url && (
        <div>
          <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">image</h6>
          <div className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
            <PropertyItem 
              label="url" 
              value={
                <div className="flex flex-col">
                  <a href={data.image.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all overflow-wrap-anywhere">
                    <span className="break-all overflow-wrap-anywhere">{data.image.url}</span>
                    <ExternalLink size={12} className="ml-1 flex-shrink-0" />
                  </a>
                  <img 
                    src={data.image.url} 
                    alt="Article image" 
                    className="mt-2 max-h-24 object-contain border dark:border-gray-700 rounded p-1"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
              } 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// パンくずリストの表示
function BreadcrumbListDisplay({ data }: { data: any }) {
  const items = data.itemListElement || [];
  
  return (
    <div className="space-y-3">
      <div className="flex items-center flex-wrap gap-2 text-sm">
        {items.map((item: any, index: number) => (
          <div key={index} className="flex items-center">
            {index > 0 && <span className="mx-1 text-gray-400">/</span>}
            <span className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded text-gray-700 dark:text-gray-300 flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">{item.position}.</span>
              {item.item && item.item.name}
            </span>
          </div>
        ))}
      </div>
      
      <div className="space-y-2">
        {items.map((item: any, index: number) => (
          <div key={index} className="border dark:border-gray-700 rounded p-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                アイテム #{item.position}
              </span>
            </div>
            <div className="pl-2 border-l-2 border-gray-200 dark:border-gray-700 space-y-1">
              {item.item && item.item["@id"] && <PropertyItem label="@id" value={item.item["@id"]} />}
              {item.item && item.item.name && <PropertyItem label="name" value={item.item.name} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 人物情報の表示
function PersonDisplay({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      {data.name && (
        <PropertyItem label="name" value={data.name} />
      )}
      
      {data.url && (
        <PropertyItem 
          label="url" 
          value={
            <a href={data.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center break-all overflow-wrap-anywhere">
              <span className="break-all overflow-wrap-anywhere">{data.url}</span>
              <ExternalLink size={12} className="ml-1 flex-shrink-0" />
            </a>
          } 
        />
      )}
      
      {data.jobTitle && (
        <PropertyItem label="jobTitle" value={data.jobTitle} />
      )}
    </div>
  );
}

// 商品情報の表示
function ProductDisplay({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      {data.name && (
        <PropertyItem label="name" value={data.name} />
      )}
      
      {data.description && (
        <PropertyItem label="description" value={data.description} />
      )}
    </div>
  );
}

// FAQ情報の表示
function FAQPageDisplay({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <PropertyItem label="@type" value="FAQPage" />
      <GenericDisplay data={data} />
    </div>
  );
}

// ハウツー情報の表示
function HowToDisplay({ data }: { data: any }) {
  return (
    <div className="space-y-3">
      <PropertyItem label="@type" value="HowTo" />
      <GenericDisplay data={data} />
    </div>
  );
}

// 汎用的な表示（未対応のタイプ用）
function GenericDisplay({ data }: { data: any }) {
  // @typeと@idを除外した主要プロパティを取得
  const mainProps = Object.keys(data).filter(key => !['@context', '@type', '@id'].includes(key));
  
  if (mainProps.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 italic">
        表示可能なプロパティがありません
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {mainProps.map(prop => {
        const value = data[prop];
        
        // オブジェクトの場合は特別な処理
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          if (value["@id"]) {
            return <PropertyItem key={prop} label={prop} value={value["@id"]} />;
          }
          
          return (
            <div key={prop}>
              <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{prop}</h6>
              <div className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                {value["@type"] && <PropertyItem label="@type" value={value["@type"]} />}
                {Object.keys(value)
                  .filter(k => k !== '@type')
                  .map(k => (
                    <PropertyItem key={k} label={k} value={value[k]} />
                  ))
                }
              </div>
            </div>
          );
        }
        
        // 配列の場合
        if (Array.isArray(value)) {
          return (
            <div key={prop}>
              <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{prop} ({value.length})</h6>
              <div className="pl-3 border-l-2 border-gray-200 dark:border-gray-700">
                {value.map((item, i) => (
                  <div key={i} className="mb-2">
                    {typeof item === 'object' && item !== null ? (
                      <div>
                        {Object.keys(item).map(k => (
                          <PropertyItem key={k} label={k} value={item[k]} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm">{String(item)}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        // 通常の値
        return <PropertyItem key={prop} label={prop} value={value} />;
      })}
    </div>
  );
}

// プロパティ項目の表示
function PropertyItem({ label, value }: { label: string, value: any }) {
  // 値が配列やオブジェクトの場合はJSON文字列に変換
  const displayValue = typeof value === 'object' && value !== null && !React.isValidElement(value)
    ? JSON.stringify(value)
    : value;
  
  return (
    <div className="mb-2">
      <h6 className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</h6>
      <div className="text-sm text-gray-800 dark:text-gray-200">
        {displayValue}
      </div>
    </div>
  );
}

// 日付のフォーマット
function formatDate(dateString: string) {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    return dateString;
  }
}

// JSON-LDの種類に応じたスタイル情報を取得
function getTypeInfo(type: string) {
  switch (type) {
    case "Organization":
      return { 
        label: "組織情報", 
        color: "text-blue-600 dark:text-blue-400", 
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        icon: Building
      };
    case "WebSite":
      return { 
        label: "Webサイト", 
        color: "text-green-600 dark:text-green-400", 
        bgColor: "bg-green-50 dark:bg-green-900/20",
        icon: Globe
      };
    case "WebPage":
      return { 
        label: "Webページ", 
        color: "text-purple-600 dark:text-purple-400", 
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
        icon: FileText
      };
    case "Article":
      return { 
        label: "記事", 
        color: "text-orange-600 dark:text-orange-400", 
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
        icon: BookOpen
      };
    case "BreadcrumbList":
      return { 
        label: "パンくずリスト", 
        color: "text-yellow-600 dark:text-yellow-400", 
        bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        icon: List
      };
    case "Person":
      return { 
        label: "人物", 
        color: "text-pink-600 dark:text-pink-400", 
        bgColor: "bg-pink-50 dark:bg-pink-900/20",
        icon: User
      };
    case "Product":
      return { 
        label: "商品", 
        color: "text-indigo-600 dark:text-indigo-400", 
        bgColor: "bg-indigo-50 dark:bg-indigo-900/20",
        icon: ShoppingBag
      };
    case "FAQPage":
      return { 
        label: "FAQ", 
        color: "text-teal-600 dark:text-teal-400", 
        bgColor: "bg-teal-50 dark:bg-teal-900/20",
        icon: HelpCircle
      };
    case "HowTo":
      return { 
        label: "ハウツー", 
        color: "text-cyan-600 dark:text-cyan-400", 
        bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
        icon: FileQuestion
      };
    default:
      return { 
        label: type || "構造化データ", 
        color: "text-gray-600 dark:text-gray-400", 
        bgColor: "bg-gray-50 dark:bg-gray-900/50",
        icon: HelpCircle
      };
  }
}
