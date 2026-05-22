import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import AuthHeader from "@/components/AuthHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TeamMatch — AI 팀 매칭 플랫폼",
  description: "AI가 추천하는 최적의 팀과 활동을 찾아보세요",
};

const navLinks = [
  { href: "/analyze", label: "AI 분석" },
  { href: "/rooms", label: "방 목록" },
  { href: "/activities", label: "활동" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-8">
            <Link href="/" className="font-bold text-lg tracking-tight text-primary">
              TeamMatch
            </Link>
            <nav className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-4">
              <Link
                href="/rooms/create"
                className="text-sm font-medium text-primary hover:underline"
              >
                + 방 만들기
              </Link>
              <AuthHeader />
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>

        <footer className="border-t mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-muted-foreground">
            TeamMatch — AI 기반 팀 매칭 플랫폼
          </div>
        </footer>
      </body>
    </html>
  );
}
