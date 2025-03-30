import { reactRouter } from "@react-router/dev/vite";
import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import type { UserConfig } from 'vite'; // UserConfig 型をインポート

export default defineConfig({
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  plugins: [reactRouter(), tsconfigPaths()],
  server: { // server プロパティを追加
    proxy: {
      // /api で始まるリクエストをプロキシする
      '/api': {
        target: 'http://localhost:8000', // バックエンドサーバーのアドレス
        changeOrigin: true, // オリジンを変更
        rewrite: (path) => path.replace(/^\/api/, ''), // パスから /api を削除
      },
    },
  },
} satisfies UserConfig); // satisfies UserConfig を追加して型チェックを強化
