import type { Route } from "./+types/home";
import { Outlet, Link } from "react-router";
import { BarChart3, Share2 } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "レポート - Lynx" },
    { name: "description", content: "サイトの分析レポートを表示します" },
  ];
}

export default function Reports() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* メインコンテンツ */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
