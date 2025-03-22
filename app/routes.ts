import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("auth/success", "routes/auth/success.tsx"),
  route("scraping", "routes/scrapying.tsx"), // /scrapingに変更（先頭の/を削除）
  route("scraping/result", "routes/scraping-results.tsx"), // 別々のルートとして定義
] satisfies RouteConfig;