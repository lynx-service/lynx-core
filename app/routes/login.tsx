import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FcGoogle } from "react-icons/fc";

export default function Login() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800 overflow-hidden max-h-[80vh]">
      <div className="bg-white dark:bg-gray-900 p-10 rounded-lg shadow-md w-full max-w-lg h-auto overflow-y-auto">
        <h2 className="text-3xl font-semibold text-gray-800 dark:text-gray-200 mb-6 text-center">LYNX</h2>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
          LYNXは効率的なサイト運営をサポートします。Googleアカウントでログインして始めましょう。
        </p>
        <a href="http://localhost:3000/auth/google">
          <button
            type="submit"
            className="flex items-center justify-center w-full py-3 px-5 text-white bg-green-500 hover:bg-green-600 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
          >
            <div className="flex items-center space-x-3">
              <FcGoogle />
              <span>Googleでサインインする</span>
            </div>
          </button>
        </a>
      </div>
    </div>
  );
}
