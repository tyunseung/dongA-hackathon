import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import CrawledActivity

router = APIRouter()


def _serialize(item: CrawledActivity) -> dict:
    fields = []
    if item.field:
        try:
            fields = json.loads(item.field)
        except Exception:
            fields = [item.field]
    return {
        "id": item.id,
        "title": item.title,
        "deadline": item.deadline,
        "url": item.url,
        "source": item.source,
        "description": item.description,
        "fields": fields,
        "difficulty": item.difficulty,
        "beginner_ok": item.beginner_ok == "true",
    }


@router.get("/")
def get_activities(db: Session = Depends(get_db)):
    items = (
        db.query(CrawledActivity)
        .order_by(CrawledActivity.created_at.desc())
        .all()
    )
    return [_serialize(i) for i in items]
