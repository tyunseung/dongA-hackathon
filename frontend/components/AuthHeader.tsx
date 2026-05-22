"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function AuthHeader() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    if (api.hasToken()) {
      setUserName(localStorage.getItem("user_name") ?? "사용자");
    }
  }, []);

  const logout = () => {
    api.clearToken();
    localStorage.removeItem("user_name");
    setUserName(null);
    router.push("/login");
  };

  if (userName) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{userName}</span>
        <Button variant="ghost" size="sm" onClick={logout} className="text-xs h-7 px-2">
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <Link href="/login">
      <Button size="sm" className="h-7 text-xs px-3">로그인</Button>
    </Link>
  );
}
