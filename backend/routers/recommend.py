from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.database import get_db
from db.models import User
from routers.auth import get_current_user
from services import recommend_service

router = APIRouter()


@router.get("/rooms")
async def get_room_recommendations(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return await recommend_service.recommend_rooms(current_user.id, db)


@router.get("/activities")
async def get_activity_recommendations(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return await recommend_service.recommend_activities(current_user.id, db)
