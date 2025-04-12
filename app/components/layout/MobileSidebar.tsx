import { Link, Form } from "react-router";
import { Button, buttonVariants } from "~/components/ui/button"; // buttonVariants をインポート
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose, // Sheetを閉じるためのコンポーネント
} from "~/components/ui/sheet";
import { cn } from "~/lib/utils";

interface MobileSidebarProps {
  isOpen: boolean; // Sheetの開閉状態
  onClose: () => void; // Sheetを閉じる関数
}

/**
 * モバイル用サイドバーナビゲーションコンポーネント (Sheet)
 * @param {MobileSidebarProps} props - コンポーネントのプロパティ
 */
export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  // Sidebar.tsx と同じナビゲーションアイテム
  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/scraping", label: "サイト分析" },
    { to: "/content", label: "コンテンツ管理" },
    { to: "/users", label: "Users" },
    { to: "/reports", label: "Reports" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0"> {/* 左から表示、パディング削除 */}
        <SheetHeader className="p-4 border-b">
          <SheetTitle>
            <Link to="/" onClick={onClose} className="flex items-center"> {/* ロゴクリックで閉じる */}
              <img
                src="/lynx_logo_main.webp"
                alt="LYNX ロゴ"
                className="h-8 w-auto"
              />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col h-[calc(100%-4rem)] p-4"> {/* ヘッダー分高さを調整 */}
          <div className="flex-grow space-y-1">
            {navItems.map((item) => (
              // SheetCloseでLinkを直接ラップし、ButtonのasChildを削除
              <SheetClose asChild key={item.label}>
                <Link
                  to={item.to}
                  // buttonVariantsとcnを使ってスタイルを適用
                  className={cn(
                    buttonVariants({ variant: "ghost" }), // 基本的なボタンスタイル
                    "w-full justify-start text-muted-foreground hover:bg-primary hover:text-primary-foreground" // カスタムスタイル
                  )}
                >
                  {item.label}
                </Link>
              </SheetClose>
            ))}
          </div>
          {/* Logoutボタン */}
          <Form method="post" action="/logout" className="mt-auto">
             {/* SheetCloseからasChildを削除 */}
             <SheetClose>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-destructive-foreground hover:bg-destructive"
              >
                Logout
              </Button>
            </SheetClose>
          </Form>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
