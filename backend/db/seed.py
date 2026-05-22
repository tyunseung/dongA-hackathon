"""
python -m db.seed
"""
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from passlib.context import CryptContext
from db.database import SessionLocal, engine
from db import models

models.Base.metadata.create_all(bind=engine)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


USERS = [
    {
        "email": "alice@test.com",
        "password": "test1234",
        "name": "김앨리스",
        "tags": ["Python", "머신러닝", "데이터분석", "Kaggle", "AI"],
    },
    {
        "email": "bob@test.com",
        "password": "test1234",
        "name": "이밥",
        "tags": ["React", "TypeScript", "웹개발", "프론트엔드", "UI/UX"],
    },
    {
        "email": "carol@test.com",
        "password": "test1234",
        "name": "박캐롤",
        "tags": ["FastAPI", "백엔드", "데이터베이스", "Docker", "클라우드"],
    },
]

ROOMS = [
    {
        "name": "AI 해커톤 준비방",
        "description": "2024 AI 해커톤을 함께 준비하는 팀입니다. 머신러닝/딥러닝 경험자 환영!",
        "tags": ["AI", "머신러닝", "해커톤", "Python", "딥러닝"],
        "owner_idx": 0,
        "member_idxs": [0, 1],
    },
    {
        "name": "부산 해커톤 팀",
        "description": "부산 스타트업 위크 해커톤 참가 팀. 풀스택 개발자 모집 중!",
        "tags": ["해커톤", "풀스택", "스타트업", "부산", "웹개발"],
        "owner_idx": 1,
        "member_idxs": [1, 2],
    },
    {
        "name": "웹 스터디 그룹",
        "description": "React + FastAPI 풀스택 스터디. 주 2회 온라인 세션 진행합니다.",
        "tags": ["React", "FastAPI", "웹개발", "스터디", "TypeScript"],
        "owner_idx": 2,
        "member_idxs": [0, 1, 2],
    },
    {
        "name": "데이터 사이언스 스터디",
        "description": "Kaggle 대회 참가를 목표로 하는 데이터 분석 스터디 모임입니다.",
        "tags": ["데이터분석", "Kaggle", "Python", "스터디", "머신러닝"],
        "owner_idx": 0,
        "member_idxs": [0, 2],
    },
    {
        "name": "공모전 준비 팀",
        "description": "SW 공모전 입상을 목표로 하는 팀. 기획/개발/디자인 모두 환영합니다.",
        "tags": ["공모전", "기획", "UI/UX", "백엔드", "프론트엔드"],
        "owner_idx": 1,
        "member_idxs": [1, 2],
    },
]

ACTIVITIES = [
    # 해커톤 3개
    {
        "room_idx": 0,
        "title": "AI 해커톤 2024",
        "description": "생성형 AI를 활용한 서비스 개발 해커톤. 총 상금 500만원. 난이도: 상",
        "tags": ["AI", "해커톤", "생성형AI", "LLM", "Python"],
    },
    {
        "room_idx": 1,
        "title": "부산 해커톤 - 스마트시티",
        "description": "부산 스타트업 위크 연계 해커톤. 스마트시티 주제. 현지 참가 필수. 난이도: 중",
        "tags": ["해커톤", "스마트시티", "부산", "IoT", "웹개발"],
    },
    {
        "room_idx": 4,
        "title": "오픈소스 해커톤",
        "description": "오픈소스 프로젝트 기여 중심 해커톤. 원격 참가 가능. 난이도: 중하",
        "tags": ["해커톤", "오픈소스", "Git", "협업"],
    },
    # 스터디 3개
    {
        "room_idx": 2,
        "title": "웹 스터디 - React 심화",
        "description": "React Query, Zustand, 성능 최적화 등 React 심화 과정. 주 2회 진행.",
        "tags": ["React", "스터디", "프론트엔드", "TypeScript", "웹개발"],
    },
    {
        "room_idx": 2,
        "title": "웹 스터디 - FastAPI 백엔드",
        "description": "FastAPI로 RESTful API 서버 구축. SQLAlchemy, JWT 인증 포함.",
        "tags": ["FastAPI", "스터디", "백엔드", "Python", "API"],
    },
    {
        "room_idx": 3,
        "title": "데이터 스터디 - EDA & 시각화",
        "description": "Pandas, Matplotlib, Seaborn을 이용한 탐색적 데이터 분석 스터디.",
        "tags": ["데이터분석", "스터디", "Python", "Pandas", "시각화"],
    },
    # 공모전 2개
    {
        "room_idx": 4,
        "title": "SW 중심대학 공모전",
        "description": "사회문제 해결형 SW 서비스 개발 공모전. 팀당 최대 4인. 상금 300만원.",
        "tags": ["공모전", "SW", "사회혁신", "웹개발", "기획"],
    },
    {
        "room_idx": 3,
        "title": "빅데이터 공모전",
        "description": "공공 빅데이터를 활용한 분석 및 시각화 공모전. 데이터 분석 역량 필수.",
        "tags": ["공모전", "빅데이터", "데이터분석", "시각화", "Kaggle"],
    },
]


def run():
    db = SessionLocal()
    try:
        if db.query(models.User).count() > 0:
            print("이미 시드 데이터가 존재합니다. 건너뜁니다.")
            return

        # 유저 생성
        user_objs: list[models.User] = []
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
            print(f"  유저 생성: {user.name} ({user.email})")

        # 방 생성
        room_objs: list[models.Room] = []
        for r in ROOMS:
            room = models.Room(
                name=r["name"],
                description=r["description"],
                owner_id=user_objs[r["owner_idx"]].id,
            )
            db.add(room)
            db.flush()
            for tag in r["tags"]:
                db.add(models.RoomTag(room_id=room.id, tag=tag))
            for idx in r["member_idxs"]:
                db.add(models.RoomMember(room_id=room.id, user_id=user_objs[idx].id))
            room_objs.append(room)
            print(f"  방 생성: {room.name}")

        # 활동 생성
        for a in ACTIVITIES:
            activity = models.Activity(
                room_id=room_objs[a["room_idx"]].id,
                title=a["title"],
                description=a["description"],
            )
            db.add(activity)
            db.flush()
            for tag in a["tags"]:
                db.add(models.ActivityTag(activity_id=activity.id, tag=tag))
            print(f"  활동 생성: {activity.title}")

        db.commit()
        print("\n시드 데이터 삽입 완료!")
        print("테스트 계정: alice@test.com / bob@test.com / carol@test.com (비밀번호: test1234)")

    except Exception as e:
        db.rollback()
        print(f"오류 발생: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
