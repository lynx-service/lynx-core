import { Form } from "react-router";

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800 overflow-hidden max-h-[80vh]">
      <div className="bg-white dark:bg-gray-900 p-10 rounded-lg shadow-md w-full max-w-lg h-auto overflow-y-auto">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">LYNX</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          LYNXは効率的なサイト運営をサポートします。Googleアカウントでログインして始めましょう。
        </p>
        <Form method="post" action="/auth/google">
          <button
            type="submit"
            className="flex items-center justify-center w-full py-3 px-5 text-white bg-blue-500 hover:bg-blue-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
          >
            <div className="flex items-center space-x-3">
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                fill="none"
              >
                <path
                  fill="#EA4335"
                  d="M24 9.5c3.94 0 6.74 1.7 8.29 3.12l6.25-6.25C34.79 3.66 29.89 2 24 2 14.85 2 7.3 7.92 4.6 16.04l7.5 5.83C13.57 14.3 18.43 9.5 24 9.5z"
                />
                <path
                  fill="#34A853"
                  d="M46.45 24.5c0-1.77-.15-3.42-.44-5.04H24v9.55h12.65c-.55 2.96-2.19 5.48-4.66 7.15l7.5 5.83C43.2 38.53 46.45 32.05 46.45 24.5z"
                />
                <path
                  fill="#4A90E2"
                  d="M9.1 28.36c-.7-2.08-1.1-4.32-1.1-6.66s.4-4.58 1.1-6.66L1.6 9.21C-1.36 14.34-1.36 21.66 1.6 26.79l7.5-5.83z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 46c5.89 0 10.79-1.93 14.38-5.25l-7.5-5.83c-2.06 1.4-4.7 2.23-6.88 2.23-5.57 0-10.43-4.8-11.92-11.26l-7.5 5.83C7.3 40.08 14.85 46 24 46z"
                />
              </svg>
              <span>Googleでサインインする</span>
            </div>
          </button>
        </Form>
      </div>
    </div>
  );
}
