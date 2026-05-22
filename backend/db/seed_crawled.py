"""
combined_results.json 데이터를 CrawledActivity 테이블에 삽입
python -m db.seed_crawled
"""
import sys, os, json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from dotenv import load_dotenv
load_dotenv()

from db.database import SessionLocal
from db import models

_HERE = os.path.dirname(os.path.abspath(__file__))
_DATA_FILE = os.path.join(_HERE, "..", "..", "combined_results.json")


def _load_data() -> list[dict]:
    with open(_DATA_FILE, encoding="utf-8") as f:
        items = json.load(f)
    result = []
    for item in items:
        result.append({
            "title": item["title"],
            "deadline": item.get("deadline"),
            "url": item.get("url"),
            "source": item.get("source", "wevity"),
            "description": item.get("description"),
            "field": json.dumps(item.get("field", []), ensure_ascii=False),
            "difficulty": item.get("difficulty"),
            "beginner_ok": "true" if item.get("beginner_ok") else "false",
        })
    return result


def run():
    db = SessionLocal()
    try:
        data = _load_data()
        existing_titles = {r.title for r in db.query(models.CrawledActivity).all()}
        added = 0
        for item in data:
            if item["title"] in existing_titles:
                print(f"  = 이미 존재: {item['title'][:40]}")
                continue
            db.add(models.CrawledActivity(**item))
            print(f"  + {item['title'][:50]}")
            added += 1
        db.commit()
        total = db.query(models.CrawledActivity).count()
        print(f"\n완료: {added}개 추가 (총 {total}개 활동)")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run()
