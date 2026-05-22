"use client";

import { useEffect, useState, useMemo } from "react";
import { ActivityCard, type ActivityCardProps } from "@/components/ActivityCard";
import { api } from "@/lib/api";

/* 백엔드 응답 타입 두 가지 */
interface RecommendItem {
  id: number;
  title: string;
  description?: string;
  tags: string[];
  url?: string;
  source?: string;
  deadline?: string;
  difficulty?: string;
  beginner_ok: boolean;
}

interface AllItem {
  id: number;
  title: string;
  description?: string;
  fields: string[];
  url?: string;
  source?: string;
  deadline?: string;
  difficulty?: string;
  beginner_ok: boolean;
}

/* 내부 정규화 타입 */
interface NormalizedActivity {
  id: number;
  title: string;
  description?: string;
  tags: string[];
  url?: string;
  source?: string;
  deadline?: string;
  difficulty?: string;
  beginner_ok: boolean;
}

const FILTER_TYPES = [
  { key: "전체" },
  { key: "해커톤" },
  { key: "공모전" },
  { key: "대외활동" },
  { key: "스터디" },
] as const;

type FilterKey = (typeof FILTER_TYPES)[number]["key"];

const FILTER_KEYWORDS: Record<FilterKey, string[]> = {
  전체: [],
  해커톤: ["해커톤"],
  공모전: ["공모전", "경진대회", "어워드", "대회"],
  대외활동: ["서포터즈", "인턴", "봉사", "활동가", "기자단", "홍보대사"],
  스터디: ["스터디", "부트캠프", "교육", "강의"],
};

function matchesFilter(a: NormalizedActivity, filter: FilterKey): boolean {
  if (filter === "전체") return true;
  const keywords = FILTER_KEYWORDS[filter];
  const haystack = [a.title, ...a.tags].join(" ").toLowerCase();
  return keywords.some((kw) => haystack.includes(kw));
}

function extractOrganizer(description?: string): string {
  if (!description) return "";
  const match = description.match(/주최[/\/]주관\n(.+?)(?:\n|$)/);
  if (match) return match[1].trim();
  const pipe = description.split("|")[0].trim();
  return pipe.length < 60 ? pipe : "";
}

function toCardProps(a: NormalizedActivity): ActivityCardProps {
  const organizer = extractOrganizer(a.description);
  return {
    title: a.title,
    organizer,
    source: a.source ?? "",
    target: a.beginner_ok ? "누구나" : "대학생",
    difficulty: (a.difficulty as ActivityCardProps["difficulty"]) ?? "beginner",
    tags: a.tags,
    deadline: a.deadline ?? "",
    url: a.url ?? "#",
  };
}

function SkeletonCard() {
  return (
    <div
      className="bg-secondary rounded-xl"
      style={{ height: "220px", border: "0.5px solid hsl(var(--border))" }}
    />
  );
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<NormalizedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("전체");

  useEffect(() => {
    const load = async () => {
      /* 로그인 상태면 추천 API 우선 시도 */
      if (api.hasToken()) {
        try {
          const data = await api.get<RecommendItem[]>("/api/recommend/activities");
          if (data.length > 0) {
            setActivities(data);
            return;
          }
        } catch {
          /* 인증 오류 등 → 전체 목록으로 폴백 */
        }
      }
      /* 비로그인 or 추천 결과 없음 → 전체 활동 목록 */
      const data = await api.get<AllItem[]>("/api/activities/");
      setActivities(
        data.map((a) => ({ ...a, tags: a.fields }))
      );
    };
    load().catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(
    () => activities.filter((a) => matchesFilter(a, activeFilter)),
    [activities, activeFilter]
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">추천 활동</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {api.hasToken()
            ? "내 태그 기반으로 추천된 공모전과 대외활동이에요."
            : "로그인하면 맞춤 추천 활동을 볼 수 있어요."}
        </p>
      </div>

      {/* 필터 바 */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_TYPES.map(({ key }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`transition-colors rounded-full px-4 py-1.5 text-sm font-medium ${
              activeFilter === key
                ? "bg-gray-900 text-white"
                : "bg-secondary text-secondary-foreground hover:bg-gray-200"
            }`}
            style={{ border: "0.5px solid hsl(var(--border))" }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* 로딩 스켈레톤 */}
      {loading && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* 빈 결과 */}
      {!loading && filtered.length === 0 && (
        <div className="py-20 text-center text-sm text-muted-foreground">
          {activities.length === 0 ? (
            <>
              <p className="font-medium text-gray-700">추천 활동이 없습니다.</p>
              <p className="mt-1">AI 분석을 먼저 완료해주세요.</p>
            </>
          ) : (
            <p>
              <span className="font-medium text-gray-700">{activeFilter}</span> 카테고리에
              해당하는 활동이 없습니다.
            </p>
          )}
        </div>
      )}

      {/* 카드 그리드 */}
      {!loading && filtered.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground -mt-2">총 {filtered.length}개</p>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
          >
            {filtered.map((activity) => (
              <ActivityCard key={activity.id} {...toCardProps(activity)} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
