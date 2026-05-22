import { Clock, ArrowRight } from "lucide-react";

export interface ActivityCardProps {
  title: string;
  organizer: string;
  source: string;
  target: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  deadline: string;
  url: string;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "초급",
  intermediate: "중급",
  advanced: "고급",
};

const DIFFICULTY_STYLE: Record<string, { background: string; color: string }> = {
  beginner: { background: "#EAF3DE", color: "#3B6D11" },
  intermediate: { background: "#FAEEDA", color: "#854F0B" },
  advanced: { background: "#FCEBEB", color: "#A32D2D" },
};

export function ActivityCard({
  title,
  organizer,
  source,
  target,
  difficulty,
  tags,
  deadline,
  url,
}: ActivityCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffDays = Math.floor(
    (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  const isUrgent = diffDays >= 0 && diffDays <= 3;

  const difficultyStyle = DIFFICULTY_STYLE[difficulty];

  return (
    <div
      className={`flex flex-col gap-3 bg-white rounded-xl activity-card${isUrgent ? " activity-card-urgent" : ""}`}
      style={{ padding: "1.25rem" }}
    >
      {/* Row 1: 뱃지 오른쪽 정렬 */}
      <div className="flex items-center justify-end gap-1.5">
        {target && (
          <span
            className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5"
            style={{ fontSize: "11px" }}
          >
            {target}
          </span>
        )}
        {difficulty && difficultyStyle && (
          <span
            className="rounded-full px-2 py-0.5 font-medium"
            style={{ fontSize: "11px", ...difficultyStyle }}
          >
            {DIFFICULTY_LABEL[difficulty]}
          </span>
        )}
      </div>

      {/* Row 2: 제목 */}
      <h3
        className="text-gray-900 line-clamp-2"
        style={{ fontSize: "15px", fontWeight: 500, lineHeight: 1.45 }}
      >
        {title}
      </h3>

      {/* Row 3: 주최기관 */}
      {organizer && (
        <p className="text-muted-foreground line-clamp-2" style={{ fontSize: "13px" }}>
          {organizer}
        </p>
      )}

      {/* Row 4: 구분선 */}
      <hr className="border-t" style={{ borderColor: "hsl(var(--border))" }} />

      {/* Row 5: 태그 */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-secondary text-secondary-foreground"
              style={{
                fontSize: "12px",
                borderRadius: "6px",
                padding: "2px 8px",
                border: "0.5px solid hsl(var(--border))",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Row 6: 마감일 왼쪽 / 자세히 보기 오른쪽 */}
      <div className="flex items-center justify-between gap-2 mt-auto pt-1">
        <div
          className="flex items-center gap-1"
          style={{
            fontSize: "12px",
            color: isUrgent ? "#A32D2D" : "hsl(var(--muted-foreground))",
          }}
        >
          <Clock style={{ width: "12px", height: "12px", flexShrink: 0 }} />
          <span>
            마감 {deadline}
            {isUrgent && " — 임박"}
          </span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:bg-secondary transition-colors"
          style={{
            fontSize: "12px",
            borderRadius: "6px",
            padding: "4px 10px",
            border: "0.5px solid hsl(var(--border))",
            color: "hsl(var(--foreground))",
            whiteSpace: "nowrap",
          }}
        >
          자세히 보기
          <ArrowRight style={{ width: "12px", height: "12px" }} />
        </a>
      </div>
    </div>
  );
}
