"""
crawled_activities 테이블에 누락된 컬럼 추가
python db/migrate_crawled.py
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from db.database import engine
from sqlalchemy import text

COLUMNS = [
    ("description", "TEXT"),
    ("field",       "TEXT"),
    ("difficulty",  "TEXT"),
    ("beginner_ok", "TEXT"),
]

with engine.connect() as conn:
    existing = [
        row[1]
        for row in conn.execute(text("PRAGMA table_info(crawled_activities)")).fetchall()
    ]
    for col, dtype in COLUMNS:
        if col not in existing:
            conn.execute(text(f"ALTER TABLE crawled_activities ADD COLUMN {col} {dtype}"))
            print(f"  + {col} 컬럼 추가")
        else:
            print(f"  = {col} 이미 존재")
    conn.commit()

print("마이그레이션 완료")
