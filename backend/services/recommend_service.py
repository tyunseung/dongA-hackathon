import asyncio
import json
from sqlalchemy.orm import Session

from db.models import UserTag, Room, CrawledActivity
from services.ai_service import generate_recommendation_reason


def _norm(tag: str) -> str:
    return tag.replace(" ", "").lower()


def calc_jaccard_score(user_tags: list[str], target_tags: list[str]) -> float:
    """Overlap coefficient with tag normalization.
    inter / min(|A|, |B|) — partial matches score higher than Jaccard/Dice.
    Normalizing removes space differences ('머신 러닝' == '머신러닝').
    """
    if not user_tags or not target_tags:
        return 0.0
    a = {_norm(t) for t in user_tags}
    b = {_norm(t) for t in target_tags}
    inter = len(a & b)
    if inter == 0:
        return 0.0
    return inter / min(len(a), len(b))


async def recommend_rooms(user_id: int, db: Session) -> list[dict]:
    user_tags = [t.tag for t in db.query(UserTag).filter(UserTag.user_id == user_id).all()]

    scored = []
    for room in db.query(Room).all():
        room_tags = [t.tag for t in room.tags]
        score = calc_jaccard_score(user_tags, room_tags)
        if score > 0:
            scored.append((room, room_tags, score))

    scored.sort(key=lambda x: x[2], reverse=True)
    top10 = scored[:10]

    async def enrich_room(room: Room, room_tags: list[str], score: float) -> dict:
        reason = await generate_recommendation_reason(
            user_tags, room_tags, room.description or room.name
        )
        return {
            "id": room.id,
            "name": room.name,
            "description": room.description,
            "tags": room_tags,
            "score": round(score, 4),
            "reason": reason,
        }

    return list(await asyncio.gather(*[enrich_room(r, rt, s) for r, rt, s in top10]))


async def recommend_activities(user_id: int, db: Session) -> list[dict]:
    user_tags = [t.tag for t in db.query(UserTag).filter(UserTag.user_id == user_id).all()]

    scored = []
    for ca in db.query(CrawledActivity).all():
        try:
            ca_tags = json.loads(ca.field) if ca.field else []
        except Exception:
            ca_tags = []
        score = calc_jaccard_score(user_tags, ca_tags)
        if score > 0:
            scored.append((ca, ca_tags, score))

    scored.sort(key=lambda x: x[2], reverse=True)
    top10 = scored[:10]

    async def enrich(ca: CrawledActivity, ca_tags: list[str], score: float) -> dict:
        reason = await generate_recommendation_reason(
            user_tags, ca_tags, ca.description or ca.title
        )
        return {
            "id": ca.id,
            "title": ca.title,
            "description": ca.description,
            "tags": ca_tags,
            "url": ca.url,
            "source": ca.source,
            "deadline": ca.deadline,
            "difficulty": ca.difficulty,
            "beginner_ok": ca.beginner_ok == "true",
            "score": round(score, 4),
            "reason": reason,
        }

    return list(await asyncio.gather(*[enrich(ca, ct, s) for ca, ct, s in top10]))
