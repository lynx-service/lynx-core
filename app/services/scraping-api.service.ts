import type { EditableScrapingResultItem, HeadingItem, InternalLinkItem } from "~/atoms/scrapingResults";

// APIサービスの型定義
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// 見出しを再帰的に処理する関数
function processHeadingsForSave(headings: HeadingItem[]): HeadingItem[] {
  return headings.map(heading => ({
    id: heading.id,
    tag: heading.tag,
    text: heading.text,
    children: heading.children && heading.children.length > 0 
      ? processHeadingsForSave(heading.children) 
      : []
  }));
}

// スクレイピング結果をバックエンドに保存する関数
export async function saveAllResults(
  token: string,
  userId: string,
  results: EditableScrapingResultItem[]
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch("http://localhost:3000/scraping/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        scrapyingResultItems: results.map(item => ({
          id: item.originalId || undefined,  // DBのIDがある場合は渡す
          url: item.url,
          title: item.title,
          content: item.content,
          index_status: item.index_status,
          internal_links: Array.isArray(item.internal_links) 
            ? item.internal_links.map(link => 
                typeof link === 'string' 
                  ? { url: link } 
                  : { id: link.id, url: link.url }
              )
            : [],
          headings: processHeadingsForSave(item.headings) // 再帰的に処理
        }))
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("Failed to save results:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "結果の保存に失敗しました" 
    };
  }
}

// スクレイピング結果を取得する関数
export async function fetchResults(token: string): Promise<ApiResponse<any[]>> {
  try {
    const response = await fetch("http://localhost:3000/scraping", {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "データの取得に失敗しました" 
    };
  }
}

// 記事を更新する関数
export async function updateArticle(
  token: string,
  item: EditableScrapingResultItem
): Promise<ApiResponse<any>> {
  try {
    const response = await fetch("http://localhost:3000/scraping/article", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: item.originalId,
        url: item.url,
        title: item.title,
        content: item.content,
        index_status: item.index_status
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error("Failed to update article:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "記事の更新に失敗しました" 
    };
  }
}

// 内部リンクを更新する関数
export async function updateInternalLinks(
  token: string,
  item: EditableScrapingResultItem
): Promise<ApiResponse<boolean>> {
  try {
    // 内部リンクの更新処理
    const updatePromises = item.internal_links.map(async (link) => {
      if (typeof link === 'string') {
        // 新規作成
        const response = await fetch("http://localhost:3000/scraping/internal-link", {
          method: "POST", // 新規作成はPOSTメソッドを使用
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            articleId: item.originalId,
            url: link
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `API error: ${response.status}`);
        }
        
        return response;
      } else if (link.id) {
        // 更新
        const response = await fetch("http://localhost:3000/scraping/internal-link", {
          method: "PUT", // 更新はPUTメソッドを使用
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: link.id,
            url: link.url
          }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `API error: ${response.status}`);
        }
        
        return response;
      }
      return Promise.resolve(); // 型エラー回避のためのダミー
    });

    // Promise.allを使用する前に、各Promiseが正しく処理されることを確認
    const results = await Promise.all(updatePromises.filter(p => p !== undefined));
    
    // エラーチェック
    for (const result of results) {
      if (result && 'ok' in result && !result.ok) {
        throw new Error(`API error: ${result.status}`);
      }
    }
    
    return { data: true, error: null };
  } catch (error) {
    console.error("Failed to update internal links:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "内部リンクの更新に失敗しました" 
    };
  }
}

// 内部リンクを削除する関数
export async function deleteInternalLink(
  token: string,
  linkId: number
): Promise<ApiResponse<boolean>> {
  try {
    const response = await fetch("http://localhost:3000/scraping/internal-link", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: linkId
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    return { data: true, error: null };
  } catch (error) {
    console.error("Failed to delete internal link:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "内部リンクの削除に失敗しました" 
    };
  }
}

// 見出しを更新する関数（再帰的）
export async function updateHeadings(
  token: string,
  item: EditableScrapingResultItem
): Promise<ApiResponse<boolean>> {
  try {
    // 見出しの更新処理（再帰的）
    const updateHeadingRecursive = async (headings: HeadingItem[], parentId?: number): Promise<void> => {
      // 各階層の見出しを順番に処理
      for (const heading of headings) {
        let headingId = heading.id;
        
        try {
          if (heading.id) {
            // 更新
            console.log(`Updating heading: ${heading.id}, ${heading.tag}, ${heading.text}`);
            const response = await fetch("http://localhost:3000/scraping/heading", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                id: heading.id,
                tag: heading.tag,
                text: heading.text
              }),
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.message || `API error: ${response.status}`);
            }
          } else {
            // 新規作成
            console.log(`Creating new heading: ${heading.tag}, ${heading.text}, parentId: ${parentId}`);
            const response = await fetch("http://localhost:3000/scraping/heading", {
              method: "POST", // 新規作成はPOSTメソッドを使用
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
              },
              body: JSON.stringify({
                articleId: item.originalId,
                parentId: parentId,
                tag: heading.tag,
                text: heading.text
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              headingId = data.id;
              heading.id = data.id; // IDを更新
              console.log(`Created heading with ID: ${headingId}`);
            } else {
              const errorData = await response.json();
              throw new Error(errorData.message || `API error: ${response.status}`);
            }
          }
          
          // 子見出しの処理（親IDが確定した後で処理）
          if (heading.children && heading.children.length > 0 && headingId) {
            await updateHeadingRecursive(heading.children, headingId);
          }
        } catch (error) {
          console.error(`Error processing heading: ${heading.tag}, ${heading.text}`, error);
          throw error; // エラーを上位に伝播
        }
      }
    };

    // 最上位の見出しから処理を開始
    await updateHeadingRecursive(item.headings);
    
    return { data: true, error: null };
  } catch (error) {
    console.error("Failed to update headings:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "見出しの更新に失敗しました" 
    };
  }
}

// 項目を削除する関数
export async function deleteItem(
  token: string,
  itemId: number
): Promise<ApiResponse<boolean>> {
  try {
    const response = await fetch(`http://localhost:3000/scraping/${itemId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `API error: ${response.status}`);
    }
    
    return { data: true, error: null };
  } catch (error) {
    console.error("Failed to delete item:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : "項目の削除に失敗しました" 
    };
  }
}
