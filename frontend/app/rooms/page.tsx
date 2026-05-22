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
  const [error, setError] = useState("");
  const [joining, setJoining] = useState<number | null>(null);
  const [joined, setJoined] = useState<Set<number>>(new Set());

  useEffect(() => {
    api
      .get<Room[]>("/api/recommend/rooms")
      .then(setRooms)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
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
          <h1 className="text-2xl font-bold">추천 방 목록</h1>
          <p className="text-muted-foreground text-sm mt-1">
            내 태그와 유사한 방을 AI가 추천합니다.
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

      {error && (
        <div className="text-center py-20 text-destructive">
          <p>{error}</p>
          <p className="text-sm text-muted-foreground mt-2">
            로그인이 필요하거나 태그가 설정되지 않았습니다.
          </p>
        </div>
      )}

      {!loading && !error && rooms.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p>추천 방이 없습니다.</p>
          <p className="text-sm mt-1">먼저 AI 분석으로 태그를 설정해보세요.</p>
          <Link href="/analyze" className="mt-4 inline-block">
            <Button variant="outline">AI 분석하기</Button>
          </Link>
        </div>
      )}

      {!loading && rooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              showScore
              onJoin={joined.has(room.id) ? undefined : handleJoin}
            />
          ))}
        </div>
      )}
    </div>
  );
}
