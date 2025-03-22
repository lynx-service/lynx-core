import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  Form,
  Link,
} from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { CiLight } from "react-icons/ci";
import { MdDarkMode } from "react-icons/md";
import { IconContext } from "react-icons/lib";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const matches = useMatches();
  const isLoginPage = matches.some((match) => match.id === "routes/login");

  // FIXME：サーバーサイドとクライアントサイドでテーマの状態が同期されない
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <html lang="ja" className={theme}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
        <Links />
      </head>
      <body className="bg-gray-100 dark:bg-gray-800 flex min-h-screen flex-col">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 shadow-md fixed top-0 left-0 w-full z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">LYNX</h1>
            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="text-gray-600 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 focus:outline-none"
            >
              <IconContext.Provider value={{ size: "1.5rem" }}>
                {theme === "light" ? (
                  <CiLight />
                ) : (
                  <MdDarkMode />
                )}
              </IconContext.Provider>
            </button>
          </div>
        </header>

        <div className="flex flex-grow pt-16">
          {/* サイドバー */}
          {!isLoginPage && (
            <aside className="text-sm bg-white dark:bg-gray-900 w-40 min-h-screen border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col fixed left-0 top-16 shadow-lg">
              <nav className="flex flex-col h-full py-4 px-2">
                <div className="flex-grow space-y-2">
                  <Link to="/" className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-emerald-600 hover:text-zinc-100 dark:hover:bg-gray-700">
                    Dashboard
                  </Link>
                  <Link to="/scraping" className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-emerald-600 hover:text-zinc-100 dark:hover:bg-gray-700">
                    サイト分析
                  </Link>
                  <Link to="/content" className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-emerald-600 hover:text-zinc-100 dark:hover:bg-gray-700">
                    コンテンツ管理
                  </Link>
                  <Link to="/users" className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-emerald-600 hover:text-zinc-100 dark:hover:bg-gray-700">
                    Users
                  </Link>
                  <Link to="/reports" className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-emerald-600 hover:text-zinc-100 dark:hover:bg-gray-700">
                    Reports
                  </Link>
                  <Link to="/settings" className="block px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-emerald-600 hover:text-zinc-100 dark:hover:bg-gray-700">
                    Settings
                  </Link>
                  <Form method="post" action="/logout">
                    <button
                      type="submit"
                      className="w-full px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-zinc-50 hover:bg-red-700 text-left">
                      Logout
                    </button>
                  </Form>
                </div>
              </nav>
            </aside>
          )}

          {/* Main Content */}
          <main className={`flex-grow ${!isLoginPage ? "ml-40" : ""} bg-gray-100 dark:bg-gray-800 p-6 text-gray-600 dark:text-gray-300`}>
            {children}
          </main>
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
