import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.tsx"),
  route("auth/success", "routes/auth/success.tsx"),
  route("/scrapying", "routes/scrapying.tsx"),
  route("/scraping-results", "routes/scraping-results.tsx"),
] satisfies RouteConfig;
