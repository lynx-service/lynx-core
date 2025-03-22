import type { ArticleItem, InternalLinkItem } from "~/types/article";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "~/components/ui/table";
import { Badge } from "~/components/ui/badge";
import { Link } from "lucide-react";

interface Props {
  item: ArticleItem;
}

export function ScrapingResultInternalLinks({ item }: Props) {
  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b dark:border-gray-700 flex items-center">
        <Link className="h-5 w-5 mr-2 text-gray-500 dark:text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">内部リンク</h3>
      </div>
      <div className="p-4 bg-white dark:bg-gray-800">
        {item.internalLinks && item.internalLinks.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>内部リンク一覧 - 合計: {item.internalLinks.length}件</TableCaption>
              <TableHeader className="bg-gray-50 dark:bg-gray-800">
                <TableRow>
                  <TableHead className="text-xs uppercase">アンカーテキスト</TableHead>
                  <TableHead className="text-xs uppercase">リンクURL</TableHead>
                  <TableHead className="text-xs uppercase">rel</TableHead>
                  <TableHead className="text-xs uppercase">ステータス</TableHead>
                  <TableHead className="text-xs uppercase">リダイレクト先</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {item.internalLinks.map((link: InternalLinkItem, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium break-all">
                      {link.anchorText || "（アンカーテキストなし）"}
                    </TableCell>
                    <TableCell>
                      <a
                        href={link.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                      >
                        {link.linkUrl}
                      </a>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={link.isFollow !== undefined 
                          ? (link.isFollow ? "default" : "destructive") 
                          : "outline"
                        }
                        className={link.isFollow !== undefined 
                          ? (link.isFollow 
                              ? "bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40" 
                              : "bg-red-100 hover:bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40")
                          : "bg-gray-100 hover:bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 dark:hover:bg-gray-900/40"
                        }
                      >
                        {link.isFollow !== undefined ? (link.isFollow ? 'follow' : 'nofollow') : '不明'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {link.status ? (
                        <Badge 
                          variant={
                            link.status.code === 200 
                              ? "default" 
                              : link.status.code === 301 || link.status.code === 302
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            link.status.code === 200 
                              ? "bg-green-100 hover:bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/40" 
                              : link.status.code === 301 || link.status.code === 302
                                ? "bg-yellow-100 hover:bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/40"
                                : "bg-red-100 hover:bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40"
                          }
                        >
                          {link.status.code}
                        </Badge>
                      ) : "不明"}
                    </TableCell>
                    <TableCell className="break-all">
                      {link.status && link.status.redirectUrl ? (
                        <a
                          href={link.status.redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {link.status.redirectUrl}
                        </a>
                      ) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            内部リンクがありません
          </div>
        )}
      </div>
    </div>
  );
}
