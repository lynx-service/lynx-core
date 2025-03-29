import { Link, Form } from "react-router";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils"; // Shadcn UIのユーティリティ関数

/**
 * デスクトップ用サイドバーナビゲーションコンポーネント
 */
export function Sidebar() {
  // ナビゲーションアイテムの定義
  const navItems = [
    { to: "/", label: "Dashboard" },
    { to: "/scraping", label: "サイト分析" }, // パスを修正
    { to: "/content", label: "コンテンツ管理" },
    { to: "/users", label: "Users" },
    { to: "/reports", label: "Reports" },
    { to: "/settings", label: "Settings" },
  ];

  return (
    // md以上で表示、固定幅、高さ、背景、ボーダー、影
    <aside className="hidden md:flex flex-col fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 border-r border-border/40 shadow-lg z-40">
      <nav className="flex flex-col h-full p-4">
        <div className="flex-grow space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost" // 背景なしボタン
              className="w-full justify-start text-gray-600 dark:text-gray-300 hover:bg-emerald-600 hover:text-zinc-100 dark:hover:bg-gray-700"
              asChild // ButtonをLinkとして機能させる
            >
              <Link to={item.to}>{item.label}</Link>
            </Button>
          ))}
        </div>
        {/* Logoutボタン */}
        <Form method="post" action="/logout" className="mt-auto">
          <Button
            type="submit"
            variant="ghost"
            className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-zinc-50 hover:bg-red-700 dark:hover:bg-red-800"
          >
            Logout
          </Button>
        </Form>
      </nav>
    </aside>
  );
}
