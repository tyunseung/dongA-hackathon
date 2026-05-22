import { Users, Star } from "lucide-react";
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
}

interface RoomCardProps {
  room: Room;
  showScore?: boolean;
  onJoin?: (id: number) => void;
}

export default function RoomCard({ room, showScore, onJoin }: RoomCardProps) {
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

        {onJoin && (
          <Button
            variant="outline"
            size="sm"
            className="mt-auto w-full"
            onClick={() => onJoin(room.id)}
          >
            참여하기
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
