import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"; // Sheet関連をインポート
import { CiLight } from "react-icons/ci";
import { MdDarkMode, MdMenu } from "react-icons/md"; // MdMenuを追加
import { IconContext } from "react-icons/lib";

type Theme = "light" | "dark";

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  onOpenMobileSidebar: () => void; // モバイルサイドバーを開く関数を受け取る
}

/**
 * アプリケーションヘッダーコンポーネント
 * @param {HeaderProps} props - コンポーネントのプロパティ
 */
export function Header({ theme, toggleTheme, onOpenMobileSidebar }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full z-50 border-b border-border/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* ロゴ */}
        <Link to="/" className="flex items-center">
          <img
            src="/lynx_logo_main.webp"
            alt="LYNX ロゴ"
            className="h-8 w-auto"
          />
        </Link>

        <div className="flex items-center space-x-4">
          {/* テーマ切り替えボタン */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none"
            aria-label={theme === "light" ? "ダークモードに切り替え" : "ライトモードに切り替え"}
          >
            <IconContext.Provider value={{ size: "1.5rem" }}>
              {theme === "light" ? <CiLight /> : <MdDarkMode />}
            </IconContext.Provider>
          </Button>

          {/* モバイル用ハンバーガーメニュー (md未満で表示) */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenMobileSidebar} // クリックでモバイルサイドバーを開く
              className="text-gray-600 dark:text-gray-300"
              aria-label="ナビゲーションメニューを開く"
            >
              <MdMenu size={24} />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
