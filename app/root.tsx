import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "react-router";
import { useEffect, useState } from "react";
import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";

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
              {theme === "light" ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m8.485-8.485l-.707.707m-15.556 0l.707.707M21 12h1M3 12H2m16.364-6.364l-.707.707M4.343 4.343l.707.707" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 1020.354 15.354z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        <div className="flex flex-grow pt-16">
          {/* サイドバー */}
          {!isLoginPage && (
            <aside className="bg-white dark:bg-gray-900 w-64 min-h-screen border-r border-gray-200 dark:border-gray-700 hidden md:block fixed left-0 top-16">
              <nav className="py-4 px-6 space-y-2">
                <a href="/" className="block px-4 py-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Dashboard
                </a>
                <a href="/users" className="block px-4 py-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Users
                </a>
                <a href="/reports" className="block px-4 py-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Reports
                </a>
                <a href="/settings" className="block px-4 py-2 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  Settings
                </a>
              </nav>
            </aside>
          )}

          {/* Main Content */}
          <main className={`flex-grow ${!isLoginPage ? "ml-64" : ""} bg-gray-50 dark:bg-gray-800 p-6`}>
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
