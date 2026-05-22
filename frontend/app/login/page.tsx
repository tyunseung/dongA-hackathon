"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUICK_ACCOUNTS = [
  { name: "김앨리스", email: "alice@test.com", password: "test1234", desc: "Python · 머신러닝 · AI" },
  { name: "이밥", email: "bob@test.com", password: "test1234", desc: "React · TypeScript · UI/UX" },
  { name: "박캐롤", email: "carol@test.com", password: "test1234", desc: "FastAPI · 백엔드 · Docker" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const doLogin = async (loginEmail: string, loginPassword: string) => {
    if (!loginEmail || !loginPassword) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post<{ access_token: string }>("/api/auth/login", {
        email: loginEmail,
        password: loginPassword,
      });
      api.setToken(res.access_token);
      const me = await api.get<{ name: string }>("/api/users/me");
      localStorage.setItem("user_name", me.name);
      router.push("/analyze");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doLogin(email, password);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">TeamMatch</h1>
          <p className="text-sm text-muted-foreground mt-1">로그인하여 AI 팀 매칭을 시작하세요</p>
        </div>

        {/* 빠른 로그인 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              테스트 계정으로 빠른 로그인
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {QUICK_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => doLogin(acc.email, acc.password)}
                disabled={loading}
                className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <span className="font-medium text-sm">{acc.name}</span>
                <span className="text-xs text-muted-foreground ml-2">{acc.desc}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          또는 직접 입력
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* 직접 입력 폼 */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={loading}
              />
              {error && (
                <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                  {error}
                </p>
              )}
              <Button type="submit" disabled={loading || !email || !password} className="w-full">
                {loading ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
