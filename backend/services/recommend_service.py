import asyncio
from sqlalchemy.orm import Session

from db.models import UserTag, Room, Activity
from services.ai_service import generate_recommendation_reason


def calc_jaccard_score(user_tags: list[str], target_tags: list[str]) -> float:
    if not user_tags or not target_tags:
        return 0.0
    a, b = set(user_tags), set(target_tags)
    union = len(a | b)
    return len(a & b) / union if union > 0 else 0.0


async def recommend_rooms(user_id: int, db: Session) -> list[dict]:
    user_tags = [t.tag for t in db.query(UserTag).filter(UserTag.user_id == user_id).all()]

    scored = []
    for room in db.query(Room).all():
        room_tags = [t.tag for t in room.tags]
        score = calc_jaccard_score(user_tags, room_tags)
        if score >= 0.1:
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
    for activity in db.query(Activity).all():
        activity_tags = [t.tag for t in activity.tags]
        score = calc_jaccard_score(user_tags, activity_tags)
        if score >= 0.1:
            scored.append((activity, activity_tags, score))

    scored.sort(key=lambda x: x[2], reverse=True)
    top10 = scored[:10]

    async def enrich_activity(activity: Activity, activity_tags: list[str], score: float) -> dict:
        reason = await generate_recommendation_reason(
            user_tags, activity_tags, activity.description or activity.title
        )
        return {
            "id": activity.id,
            "room_id": activity.room_id,
            "title": activity.title,
            "description": activity.description,
            "tags": activity_tags,
            "score": round(score, 4),
            "reason": reason,
        }

    return list(await asyncio.gather(*[enrich_activity(a, at, s) for a, at, s in top10]))
