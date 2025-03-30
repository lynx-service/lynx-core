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
    <div className="border rounded-lg overflow-hidden">
      <div className="px-4 py-2 border-b flex items-center">
        <Link className="h-5 w-5 mr-2 text-muted-foreground" />
        <h3 className="text-lg font-medium text-foreground">内部リンク</h3>
      </div>
      <div className="p-4 bg-card">
        {item.internalLinks && item.internalLinks.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>内部リンク一覧 - 合計: {item.internalLinks.length}件</TableCaption>
              <TableHeader>
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
                    <TableCell className="font-medium break-all overflow-wrap-anywhere max-w-[200px]">
                      {link.anchorText || "（アンカーテキストなし）"}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <a
                        href={link.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all overflow-wrap-anywhere"
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
                              ? "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-400")
                          : "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
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
                              ? "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                              : link.status.code === 301 || link.status.code === 302
                                ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {link.status.code}
                        </Badge>
                      ) : "不明"}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      {link.status && link.status.redirectUrl ? (
                        <a
                          href={link.status.redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline break-all overflow-wrap-anywhere"
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
          <div className="text-center py-4 text-muted-foreground">
            内部リンクがありません
          </div>
        )}
      </div>
    </div>
  );
}
