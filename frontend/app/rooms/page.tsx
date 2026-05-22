"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, X, Users, Star, ExternalLink, Calendar, Zap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RoomCard, { type Room } from "@/components/RoomCard";
import RoomChatModal from "@/components/RoomChatModal";
import { api } from "@/lib/api";

function ActivityDesc({ description }: { description: string }) {
  const parts = description.split("|").map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) {
    return <p className="text-sm text-muted-foreground mt-1">{description}</p>;
  }
  const [organizer, ...meta] = parts;
  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <span className="text-sm font-medium text-foreground">{organizer}</span>
      <div className="flex flex-wrap gap-1">
        {meta.map((m, i) => (
          <span key={i} className="text-xs bg-muted text-muted-foreground rounded-md px-2 py-0.5">
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

interface Activity {
  id: number;
  source: "room" | "crawled";
  title: string;
  description?: string;
  tags: string[];
  url?: string | null;
  deadline?: string | null;
  difficulty?: string | null;
  beginner_ok?: boolean | null;
  overlap: number;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const [joined, setJoined] = useState<Set<number>>(new Set());
  const [hasScores, setHasScores] = useState(false);
  const [selected, setSelected] = useState<Room | null>(null);
  const [recommendedActivities, setRecommendedActivities] = useState<Activity[] | null>(null);
  const [chatRoom, setChatRoom] = useState<Room | null>(null);

  useEffect(() => {
    const load = async () => {
      const all = await api.get<Room[]>("/api/rooms/");
      setRooms(all);
      setJoined(new Set(all.filter((r) => r.is_member).map((r) => r.id)));
      setLoading(false);

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
          .catch(() => {});
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
      const activities = await api.get<Activity[]>(`/api/rooms/${id}/recommended-activities`);
      setRecommendedActivities(activities);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "참여 실패");
      setSelected(null);
    } finally {
      setJoining(null);
    }
  };

  const closeAll = () => {
    setSelected(null);
    setRecommendedActivities(null);
  };

  const openChat = (room: Room) => setChatRoom(room);
  const closeChat = () => setChatRoom(null);

  const sortedRooms = rooms.slice().sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">방 목록</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {hasScores
              ? "내 태그 기반 AI 추천 점수가 표시됩니다."
              : "로그인 후 태그를 생성하면 맞춤 추천 점수를 볼 수 있어요."}
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
          {sortedRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              showScore={hasScores}
              isMember={joined.has(room.id)}
              onJoin={joined.has(room.id) ? undefined : () => setSelected(room)}
              onChat={joined.has(room.id) ? () => openChat(room) : undefined}
            />
          ))}
        </div>
      )}

      {/* 참여 확인 모달 */}
      {selected && recommendedActivities === null && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeAll()}
        >
          <Card className="w-full max-w-md">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg leading-snug">{selected.name}</CardTitle>
                <button
                  onClick={closeAll}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {selected.score !== undefined && (
                  <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold">
                    <Star className="w-4 h-4 fill-current" />
                    매칭 {(selected.score * 100).toFixed(0)}%
                  </span>
                )}
                {selected.member_count !== undefined && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="w-3 h-3" />
                    {selected.member_count}명 참여 중
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-4">
              {selected.description && (
                <p className="text-sm text-muted-foreground">{selected.description}</p>
              )}

              <div className="flex flex-wrap gap-1">
                {selected.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {selected.reason && (
                <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-3 py-2 italic">
                  AI 추천 이유: {selected.reason}
                </p>
              )}

              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1"
                  onClick={() => handleJoin(selected.id)}
                  disabled={joining === selected.id}
                >
                  {joining === selected.id ? "참여 중..." : "참여 확정"}
                </Button>
                <Button variant="outline" onClick={closeAll}>
                  닫기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 참여 완료 - 추천 활동 전체화면 패널 */}
      {selected && recommendedActivities !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  <h2 className="text-xl font-bold">{selected.name} 참여 완료!</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1">이 방의 태그와 맞는 공모전·활동을 추천해 드려요</p>
              </div>
              <button
                onClick={closeAll}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {recommendedActivities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-base">현재 매칭되는 활동이 없습니다.</p>
                  <p className="text-sm mt-1">활동 페이지에서 더 많은 공모전을 확인하세요.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {recommendedActivities.map((a) => (
                    <div
                      key={`${a.source}-${a.id}`}
                      className="border rounded-xl px-4 py-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-base">{a.title}</span>
                            {a.source === "crawled" && (
                              <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                                공모전
                              </Badge>
                            )}
                            {a.beginner_ok && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                                입문 가능
                              </Badge>
                            )}
                          </div>
                          {a.description && (
                            <ActivityDesc description={a.description} />
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {a.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                          <span className="text-xs font-semibold text-amber-600 bg-amber-50 rounded-full px-2 py-0.5">
                            태그 {a.overlap}개 일치
                          </span>
                          {a.difficulty && (
                            <span className="text-xs text-muted-foreground">{a.difficulty}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        {a.deadline && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            마감 {a.deadline}
                          </span>
                        )}
                        {a.url && (
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            자세히 보기
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="flex gap-3 px-6 py-4 border-t">
              <Link href="/activities" className="flex-1">
                <Button variant="outline" className="w-full gap-2">
                  <Zap className="w-4 h-4" />
                  전체 활동 보기
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  const room = selected;
                  closeAll();
                  if (room) setChatRoom(room);
                }}
              >
                <MessageCircle className="w-4 h-4" />
                채팅하기
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 채팅 모달 */}
      {chatRoom && (
        <RoomChatModal
          roomName={chatRoom.name}
          memberCount={chatRoom.member_count}
          onClose={closeChat}
        />
      )}
    </div>
  );
}
