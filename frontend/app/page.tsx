import Link from "next/link";
import { MessageSquare, Users, Zap, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: MessageSquare,
    title: "AI 챗봇 분석",
    desc: "대화를 통해 관심사와 기술 스택을 파악하고 자동으로 태그를 생성합니다.",
    href: "/analyze",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: FileText,
    title: "PDF 이력서 분석",
    desc: "이력서나 포트폴리오 PDF를 업로드하면 AI가 핵심 역량을 추출합니다.",
    href: "/analyze",
    color: "text-purple-600 bg-purple-50",
  },
  {
    icon: Users,
    title: "팀 매칭",
    desc: "태그 중복도 기반으로 나와 가장 잘 맞는 팀과 방을 AI가 추천합니다.",
    href: "/rooms",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Zap,
    title: "활동 추천",
    desc: "해커톤, 스터디, 공모전 등 내 관심사에 딱 맞는 활동을 추천받으세요.",
    href: "/activities",
    color: "text-amber-600 bg-amber-50",
  },
];

const steps = [
  { num: "01", title: "대화 or PDF 업로드", desc: "AI 챗봇과 대화하거나 이력서를 업로드하세요" },
  { num: "02", title: "태그 자동 생성", desc: "AI가 관심사와 기술을 분석해 태그를 만들어 줍니다" },
  { num: "03", title: "팀·활동 추천", desc: "태그 중복도 점수로 가장 잘 맞는 팀과 활동을 추천합니다" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-20">
      {/* Hero */}
      <section className="text-center py-16 flex flex-col items-center gap-6">
        <span className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm px-4 py-1.5 rounded-full font-medium">
          <Zap className="w-4 h-4" />
          AI 기반 팀 매칭 플랫폼
        </span>
        <h1 className="text-5xl font-bold text-foreground max-w-2xl leading-tight tracking-tight">
          나에게 딱 맞는 팀을<br />
          <span className="text-primary">AI가 찾아드립니다</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
          챗봇과 대화하거나 이력서를 업로드하면 AI가 관심사를 분석하고,
          태그 중복도 기반으로 최적의 팀과 활동을 추천합니다.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/analyze">
            <Button size="lg" className="gap-2">
              AI 분석 시작하기 <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/rooms">
            <Button size="lg" variant="outline">
              방 둘러보기
            </Button>
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-xl font-semibold text-center mb-8 text-muted-foreground uppercase tracking-widest text-xs">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div key={step.num} className="flex flex-col items-center text-center gap-3">
              <span className="text-4xl font-black text-primary/20">{step.num}</span>
              <h3 className="font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section>
        <h2 className="text-xl font-semibold text-center mb-6">주요 기능</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => (
            <Link key={f.title} href={f.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${f.color}`}>
                      <f.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-base">{f.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-4">
        <div className="flex justify-center gap-3 flex-wrap">
          <Link href="/analyze"><Button variant="outline">AI 분석</Button></Link>
          <Link href="/rooms"><Button variant="outline">추천 방</Button></Link>
          <Link href="/rooms/create"><Button variant="outline">방 만들기</Button></Link>
          <Link href="/activities"><Button variant="outline">추천 활동</Button></Link>
        </div>
      </section>
    </div>
  );
}
