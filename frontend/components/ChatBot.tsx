"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import TagBadge from "@/components/TagBadge";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatBotProps {
  onTagsGenerated?: (tags: string[]) => void;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "안녕하세요! 관심 있는 분야, 기술 스택, 참여하고 싶은 활동 등을 자유롭게 이야기해 주세요. AI가 최적의 팀을 추천해드릴게요 😊",
};

export default function ChatBot({ onTagsGenerated }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post<{ response: string }>("/api/analyze/chat", {
        messages: next,
      });
      setMessages([...next, { role: "assistant", content: res.response }]);
    } catch {
      setMessages([
        ...next,
        { role: "assistant", content: "오류가 발생했습니다. 다시 시도해 주세요." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateTags = async () => {
    if (loading || messages.length < 2) return;
    setLoading(true);
    try {
      const res = await api.post<{ tags: string[] }>("/api/analyze/generate-tags", {
        conversation: messages,
      });
      setGeneratedTags(res.tags);
      onTagsGenerated?.(res.tags);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <ScrollArea className="h-72 rounded-lg border bg-muted/30 p-3">
        <div className="flex flex-col gap-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-background border rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-background border px-4 py-2 rounded-2xl rounded-bl-sm text-sm text-muted-foreground">
                입력 중...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="관심 분야, 기술, 목표를 입력하세요… (Enter로 전송)"
          className="resize-none min-h-0"
          rows={2}
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()} size="icon" className="self-end shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      </div>

      <Button
        variant="outline"
        onClick={generateTags}
        disabled={loading || messages.length < 2}
        className="gap-2"
      >
        <Sparkles className="w-4 h-4" />
        대화 기반 태그 생성
      </Button>

      {generatedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg">
          {generatedTags.map((tag) => (
            <TagBadge key={tag} tag={tag} aiGenerated />
          ))}
        </div>
      )}
    </div>
  );
}
