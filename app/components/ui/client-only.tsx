import { useEffect, useState } from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * クライアントサイドでのみレンダリングされるコンポーネントをラップするためのコンポーネント
 * SSRでは`fallback`を表示し、クライアントサイドでマウント後に`children`を表示する
 */
export function ClientOnly({ children, fallback = <div className="h-[300px] animate-pulse bg-muted rounded-md" /> }: ClientOnlyProps) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return fallback;
  }
  
  return <>{children}</>;
}
