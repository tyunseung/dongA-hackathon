import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TagBadgeProps {
  tag: string;
  aiGenerated?: boolean;
  className?: string;
}

export default function TagBadge({ tag, aiGenerated, className }: TagBadgeProps) {
  return (
    <Badge
      variant={aiGenerated ? "default" : "secondary"}
      className={cn("gap-1 text-xs font-normal", className)}
    >
      {aiGenerated && <Sparkles className="w-3 h-3" />}
      {tag}
    </Badge>
  );
}
