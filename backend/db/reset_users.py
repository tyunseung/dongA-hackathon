"""
기존 계정 전체 삭제 후 태윤승·이승민만 생성
python db/reset_users.py
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from passlib.context import CryptContext
from db.database import SessionLocal
from db import models

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USERS = [
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
        print("기존 데이터 삭제 중...")
        db.query(models.Recommendation).delete()
        db.query(models.RoomMember).delete()
        db.query(models.UserTag).delete()
        db.query(models.User).delete()
        db.flush()
        print("  완료: 기존 유저/태그/멤버십/추천 삭제")

        user_objs = []
        for u in USERS:
            user = models.User(
                email=u["email"],
                password_hash=pwd_context.hash(u["password"]),
                name=u["name"],
            )
            db.add(user)
            db.flush()
            for tag in u["tags"]:
                db.add(models.UserTag(user_id=user.id, tag=tag))
            user_objs.append(user)
            print(f"  생성: {user.name} ({user.email})")

        # 모든 방 소유자 → 태윤승 (방 데이터는 유지)
        tae_id = user_objs[0].id
        db.query(models.Room).update({"owner_id": tae_id})
        room_count = db.query(models.Room).count()
        print(f"  방 소유자 → 태윤승 (총 {room_count}개 방)")

        db.commit()
        print("\n완료!")
        print("  태윤승: tyunseung@gmail.com / test1234")
        print("  이승민: lsm@test.com / test1234")
        print("  (두 계정 모두 방 참여 없는 상태 -> 참여하기 버튼 정상 표시)")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run()
