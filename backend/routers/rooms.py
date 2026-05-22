from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from db.database import get_db
from db.models import Room, RoomMember, RoomTag, User
from routers.auth import get_current_user
from services import ai_service

router = APIRouter()


class RoomCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    tags: list[str] = []


@router.get("/")
def list_rooms(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "tags": [t.tag for t in r.tags],
            "member_count": len(r.members),
            "owner_id": r.owner_id,
        }
        for r in db.query(Room).all()
    ]


@router.post("/", status_code=201)
def create_room(
    req: RoomCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = Room(name=req.name, description=req.description, owner_id=current_user.id)
    db.add(room)
    db.flush()
    for tag in req.tags:
        db.add(RoomTag(room_id=room.id, tag=tag))
    db.add(RoomMember(room_id=room.id, user_id=current_user.id))
    db.commit()
    db.refresh(room)
    return {
        "id": room.id,
        "name": room.name,
        "description": room.description,
        "tags": req.tags,
    }


@router.get("/{room_id}")
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    return {
        "id": room.id,
        "name": room.name,
        "description": room.description,
        "tags": [t.tag for t in room.tags],
        "owner_id": room.owner_id,
        "members": [{"id": m.user.id, "name": m.user.name} for m in room.members],
        "activities": [{"id": a.id, "title": a.title} for a in room.activities],
    }


@router.post("/{room_id}/join")
def join_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Room).filter(Room.id == room_id).first():
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    already = (
        db.query(RoomMember)
        .filter(RoomMember.room_id == room_id, RoomMember.user_id == current_user.id)
        .first()
    )
    if already:
        raise HTTPException(status_code=400, detail="이미 참여한 방입니다")
    db.add(RoomMember(room_id=room_id, user_id=current_user.id))
    db.commit()
    return {"message": "방에 참여했습니다"}


@router.get("/{room_id}/team-status")
async def team_status(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="방을 찾을 수 없습니다")
    members_data = [
        {"name": m.user.name, "tags": [t.tag for t in m.user.tags]}
        for m in room.members
    ]
    analysis = await ai_service.analyze_team_status(members_data)
    return {"room_id": room_id, "members": members_data, "analysis": analysis}
