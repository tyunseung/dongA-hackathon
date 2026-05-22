"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  id: number;
  sender: string;
  content: string;
  time: string;
  isMe?: boolean;
}

interface RoomChatModalProps {
  roomName: string;
  memberCount?: number;
  onClose: () => void;
}

const HARDCODED_MESSAGES: ChatMessage[] = [
  { id: 1, sender: "김민준", content: "안녕하세요! 방에 오신 걸 환영해요 😊", time: "14:20" },
  { id: 2, sender: "이서연", content: "반갑습니다~ 어떤 분야에 관심 있으세요?", time: "14:21" },
  { id: 3, sender: "박준혁", content: "저는 백엔드 개발에 관심 있어요. 같이 공모전 나가봐요!", time: "14:23" },
  { id: 4, sender: "김민준", content: "이번 동아일보 AI 해커톤 같이 준비하실 분 찾고 있어요", time: "14:25" },
  { id: 5, sender: "이서연", content: "저 참여하고 싶어요! 어떤 주제로 할 예정인가요?", time: "14:26" },
];

export default function RoomChatModal({ roomName, memberCount, onClose }: RoomChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(HARDCODED_MESSAGES);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(HARDCODED_MESSAGES.length + 1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;

    setMessages((prev) => [
      ...prev,
      { id: nextId.current++, sender: "나", content: text, time, isMe: true },
    ]);
    setInput("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col h-[80vh] sm:h-[600px]">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground sm:rounded-t-2xl">
          <div className="flex flex-col">
            <span className="font-bold text-base">{roomName}</span>
            {memberCount !== undefined && (
              <span className="flex items-center gap-1 text-xs opacity-80 mt-0.5">
                <Users className="w-3 h-3" />
                {memberCount}명 참여 중
              </span>
            )}
          </div>
          <button onClick={onClose} className="opacity-80 hover:opacity-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메시지 목록 */}
        <ScrollArea className="flex-1 px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="text-center text-xs text-muted-foreground bg-muted rounded-full px-3 py-1 mx-auto">
              {roomName} 채팅방에 입장했습니다
            </div>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? "items-end" : "items-start"}`}
              >
                {!msg.isMe && (
                  <span className="text-xs text-muted-foreground mb-1 ml-1">{msg.sender}</span>
                )}
                <div className="flex items-end gap-1.5">
                  {msg.isMe && (
                    <span className="text-[10px] text-muted-foreground mb-0.5">{msg.time}</span>
                  )}
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      msg.isMe
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  {!msg.isMe && (
                    <span className="text-[10px] text-muted-foreground mb-0.5">{msg.time}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* 입력창 */}
        <div className="flex items-center gap-2 px-4 py-3 border-t">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="메시지를 입력하세요..."
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={!input.trim()} size="icon">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
