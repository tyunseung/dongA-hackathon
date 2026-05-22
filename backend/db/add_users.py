"""
태윤승, 이승민 계정 추가 및 방 참여 초기화
python db/add_users.py
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from passlib.context import CryptContext
from db.database import SessionLocal
from db import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

NEW_USERS = [
    {
        "email": "tyunseung@gmail.com",
        "password": "test1234",
        "name": "태윤승",
        "tags": ["Python", "AI", "백엔드", "FastAPI", "머신러닝", "해커톤"],
    },
    {
        "email": "lsm@test.com",
        "password": "test1234",
        "name": "이승민",
        "tags": ["React", "프론트엔드", "TypeScript", "UI/UX", "웹개발", "공모전"],
    },
]


def run():
    db = SessionLocal()
    try:
        for u in NEW_USERS:
            existing = db.query(models.User).filter(models.User.email == u["email"]).first()
            if existing:
                # 방 멤버십 전부 삭제
                db.query(models.RoomMember).filter(models.RoomMember.user_id == existing.id).delete()
                print(f"  기존 유저 방 참여 초기화: {existing.name}")
            else:
                user = models.User(
                    email=u["email"],
                    password_hash=pwd_context.hash(u["password"]),
                    name=u["name"],
                )
                db.add(user)
                db.flush()
                for tag in u["tags"]:
                    db.add(models.UserTag(user_id=user.id, tag=tag))
                print(f"  유저 생성: {user.name} ({user.email})")

        db.commit()
        print("\n완료!")
        print("  태윤승: tyunseung@gmail.com / test1234")
        print("  이승민: lsm@test.com / test1234")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run()
