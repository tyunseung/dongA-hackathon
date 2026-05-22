import { Users, Star, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import TagBadge from "@/components/TagBadge";

export interface Room {
  id: number;
  name: string;
  description?: string;
  tags: string[];
  score?: number;
  reason?: string;
  member_count?: number;
  is_member?: boolean;
}

interface RoomCardProps {
  room: Room;
  showScore?: boolean;
  isMember?: boolean;
  onJoin?: () => void;
  onChat?: () => void;
}

export default function RoomCard({ room, showScore, isMember, onJoin, onChat }: RoomCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{room.name}</CardTitle>
          {showScore && room.score !== undefined && (
            <div className="flex items-center gap-1 text-amber-500 shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-semibold">{(room.score * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
        {room.member_count !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{room.member_count}명 참여 중</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex flex-col gap-3 flex-1">
        {room.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{room.description}</p>
        )}

        <div className="flex flex-wrap gap-1">
          {room.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>

        {room.reason && (
          <p className="text-xs text-blue-700 bg-blue-50 rounded-md px-3 py-2 italic">
            💡 {room.reason}
          </p>
        )}

        {isMember ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-auto w-full gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
            onClick={onChat}
          >
            <MessageCircle className="w-4 h-4" />
            채팅하기
          </Button>
        ) : onJoin && (
          <Button
            variant="outline"
            size="sm"
            className="mt-auto w-full"
            onClick={() => onJoin()}
          >
            참여하기
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
