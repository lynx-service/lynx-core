export function ScrapingEmptyState() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center animate-fade-in">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
        スクレイピング結果がありません
      </h3>
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        スクレイピング画面から新しいURLをスクレイピングしてください
      </p>
    </div>
  );
}
