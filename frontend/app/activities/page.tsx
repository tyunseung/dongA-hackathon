"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TagBadge from "@/components/TagBadge";
import { api } from "@/lib/api";

interface Activity {
  id: number;
  room_id: number;
  title: string;
  description?: string;
  tags: string[];
  score: number;
  reason: string;
}

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get<Activity[]>("/api/recommend/activities")
      .then(setActivities)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">추천 활동</h1>
        <p className="text-muted-foreground text-sm mt-1">
          내 태그와 유사한 해커톤, 스터디, 공모전을 AI가 추천합니다.
        </p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-destructive">
          <p>{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            로그인이 필요하거나 태그가 설정되지 않았습니다.
          </p>
          <Link href="/analyze" className="mt-4 inline-block">
            <Button variant="outline">AI 분석하기</Button>
          </Link>
        </div>
      )}

      {!loading && !error && activities.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>추천 활동이 없습니다.</p>
          <p className="text-sm mt-1">먼저 AI 분석으로 태그를 설정해보세요.</p>
          <Link href="/analyze" className="mt-4 inline-block">
            <Button variant="outline">AI 분석하기</Button>
          </Link>
        </div>
      )}

      {!loading && activities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => (
            <Card key={activity.id} className="flex flex-col hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{activity.title}</CardTitle>
                  <div className="flex items-center gap-1 text-amber-500 shrink-0">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">
                      {(activity.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  <span>방 #{activity.room_id}</span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 flex-1">
                {activity.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activity.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-1">
                  {activity.tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>

                {activity.reason && (
                  <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-3 py-2 italic">
                    💡 {activity.reason}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
