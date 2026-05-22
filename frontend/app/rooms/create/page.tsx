"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TagBadge from "@/components/TagBadge";
import { api } from "@/lib/api";

export default function CreateRoomPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      await api.post("/api/rooms", { name: name.trim(), description: description.trim(), tags });
      router.push("/rooms");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "방 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">방 만들기</h1>
        <p className="text-muted-foreground text-sm mt-1">
          팀을 소개하고 맞는 사람들을 모아보세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">방 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">방 이름 *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: AI 해커톤 팀"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">설명</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="팀 소개, 모집 조건, 활동 계획 등을 입력하세요"
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">태그</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); addTag(); }
                  }}
                  placeholder="예: Python, AI, 해커톤"
                />
                <Button type="button" variant="outline" onClick={addTag} className="shrink-0">
                  추가
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {tags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1">
                      <TagBadge tag={tag} />
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading || !name.trim()} className="w-full">
              {loading ? "생성 중…" : "방 만들기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
