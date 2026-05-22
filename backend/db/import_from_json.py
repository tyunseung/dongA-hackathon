"""
data/activities.json → CrawledActivity DB 테이블로 가져오기
python db/import_from_json.py [파일경로]  (기본: data/activities.json)

기존 항목은 title 기준으로 중복 체크 후 건너뜁니다.
"""
import sys, os, json
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from db.database import SessionLocal
from db import models

ALLOWED = {"title", "deadline", "url", "source", "description", "field", "difficulty", "beginner_ok"}


def run(json_path: str | None = None):
    if not json_path:
        json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "activities.json")

    if not os.path.exists(json_path):
        print(f"파일 없음: {json_path}")
        print("먼저 크롤러를 실행하세요: python crawler/http_wevity.py")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        items: list[dict] = json.load(f)

    print(f"JSON 파일: {json_path} ({len(items)}개)")

    db = SessionLocal()
    try:
        existing_titles = {r.title for r in db.query(models.CrawledActivity).all()}
        added = skipped = 0

        for item in items:
            title = item.get("title", "").strip()
            if not title:
                continue
            if title in existing_titles:
                skipped += 1
                continue

            # field가 list면 JSON 문자열로 변환
            if isinstance(item.get("field"), list):
                item["field"] = json.dumps(item["field"], ensure_ascii=False)

            # beginner_ok bool → 문자열
            if isinstance(item.get("beginner_ok"), bool):
                item["beginner_ok"] = str(item["beginner_ok"]).lower()

            filtered = {k: v for k, v in item.items() if k in ALLOWED}
            db.add(models.CrawledActivity(**filtered))
            existing_titles.add(title)
            sys.stdout.buffer.write(f"  + {title[:45]}\n".encode("utf-8", "replace"))
            added += 1

        db.commit()
        total = db.query(models.CrawledActivity).count()
        sys.stdout.buffer.write(f"\n완료: {added}개 추가, {skipped}개 중복 건너뜀 (총 {total}개)\n".encode("utf-8", "replace"))
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    path = sys.argv[1] if len(sys.argv) > 1 else None
    run(path)
