import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

/**
 * テーマの状態を管理し、切り替え機能を提供するカスタムフック
 * @returns {object} テーマの状態と切り替え関数
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  // localStorageから初期テーマを取得、なければ'light'をデフォルトに
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "light";
    }
    return "light"; // SSR時はデフォルト'light'
  });

  // テーマが変更されたら<html>要素のクラスを更新し、localStorageに保存
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // テーマを切り替える関数
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  }, []);

  return { theme, toggleTheme };
}
