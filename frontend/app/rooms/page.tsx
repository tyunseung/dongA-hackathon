"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoomCard, { type Room } from "@/components/RoomCard";
import { api } from "@/lib/api";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const [joined, setJoined] = useState<Set<number>>(new Set());
  const [hasScores, setHasScores] = useState(false);

  useEffect(() => {
    const load = async () => {
      // 전체 방 목록 (인증 불필요)
      const all = await api.get<Room[]>("/api/rooms/");
      setRooms(all);
      setLoading(false);

      // 로그인 상태면 AI 추천 점수 추가
      if (api.hasToken()) {
        api
          .get<Room[]>("/api/recommend/rooms")
          .then((recommended) => {
            if (recommended.length === 0) return;
            const scoreMap = new Map(recommended.map((r) => [r.id, r]));
            setRooms(
              all.map((r) => {
                const rec = scoreMap.get(r.id);
                return rec ? { ...r, score: rec.score, reason: rec.reason } : r;
              })
            );
            setHasScores(true);
          })
          .catch(() => {}); // 태그 없거나 실패해도 전체 목록은 유지
      }
    };

    load().catch(() => setLoading(false));
  }, []);

  const handleJoin = async (id: number) => {
    if (joining) return;
    setJoining(id);
    try {
      await api.post(`/api/rooms/${id}/join`);
      setJoined((prev) => new Set(prev).add(id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "참여 실패");
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">방 목록</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {hasScores
              ? "내 태그 기반 AI 추천 점수가 표시됩니다."
              : "로그인 후 AI 분석으로 태그를 생성하면 맞춤 추천 점수를 볼 수 있어요."}
          </p>
        </div>
        <Link href="/rooms/create">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            방 만들기
          </Button>
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!loading && rooms.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>아직 방이 없습니다.</p>
          <Link href="/rooms/create" className="mt-4 inline-block">
            <Button variant="outline">첫 번째 방 만들기</Button>
          </Link>
        </div>
      )}

      {!loading && rooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms
            .slice()
            .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
            .map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                showScore={hasScores}
                onJoin={joined.has(room.id) ? undefined : handleJoin}
              />
            ))}
        </div>
      )}
    </div>
  );
}
