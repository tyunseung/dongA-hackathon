from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from db.database import get_db
from db.models import User, UserTag
from routers.auth import get_current_user

router = APIRouter()


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None


class TagsRequest(BaseModel):
    tags: list[str]


def _user_dict(user: User) -> dict:
    return {"id": user.id, "email": user.email, "name": user.name}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return _user_dict(current_user)


@router.put("/me")
def update_me(
    req: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.name is not None:
        current_user.name = req.name
    db.commit()
    db.refresh(current_user)
    return _user_dict(current_user)


@router.get("/me/tags")
def get_my_tags(current_user: User = Depends(get_current_user)):
    return {"tags": [t.tag for t in current_user.tags]}


@router.post("/me/tags", status_code=201)
def add_my_tags(
    req: TagsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = {t.tag for t in current_user.tags}
    for tag in req.tags:
        if tag not in existing:
            db.add(UserTag(user_id=current_user.id, tag=tag))
    db.commit()
    db.refresh(current_user)
    return {"tags": [t.tag for t in current_user.tags]}
