"""
다양한 분야 방 추가
python db/add_rooms.py
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from db.database import SessionLocal
from db import models

NEW_ROOMS = [
    {
        "name": "AI 논문 읽기 스터디",
        "description": "매주 최신 AI/ML 논문을 함께 읽고 토론합니다. NLP, Vision, RL 등 다양한 분야 다룹니다.",
        "tags": ["AI", "머신러닝", "딥러닝", "논문", "Python", "연구"],
    },
    {
        "name": "웹 풀스택 프로젝트 팀",
        "description": "React + FastAPI로 실서비스 수준의 사이드 프로젝트를 만들어가는 팀입니다.",
        "tags": ["React", "FastAPI", "TypeScript", "웹개발", "풀스택", "PostgreSQL"],
    },
    {
        "name": "모바일 앱 스타트업 팀",
        "description": "Flutter로 크로스플랫폼 앱을 개발 중입니다. iOS/Android 동시 출시 목표.",
        "tags": ["Flutter", "앱개발", "모바일", "스타트업", "Dart", "Firebase"],
    },
    {
        "name": "UI/UX 디자인 스터디",
        "description": "Figma 기반 실무 디자인 스터디. 포트폴리오 제작 병행. 개발자도 환영.",
        "tags": ["UI/UX", "디자인", "Figma", "프론트엔드", "포트폴리오"],
    },
    {
        "name": "알고리즘 코딩 테스트 준비",
        "description": "백준, 프로그래머스 문제 매일 풀고 풀이 공유. 취업 코테 대비 팀.",
        "tags": ["알고리즘", "코딩테스트", "Python", "Java", "자료구조", "취업"],
    },
    {
        "name": "창업 아이디어 발굴팀",
        "description": "아이디어 발굴부터 MVP 제작까지. 개발·디자인·기획 모두 환영합니다.",
        "tags": ["창업", "스타트업", "기획", "MVP", "비즈니스", "아이디어"],
    },
    {
        "name": "게임 개발 인디 팀",
        "description": "Unity로 인디 게임 개발 중. 스팀 출시 목표. 프로그래머 및 아티스트 모집.",
        "tags": ["게임개발", "Unity", "C#", "인디게임", "그래픽", "아트"],
    },
    {
        "name": "클라우드 & DevOps 스터디",
        "description": "AWS, Docker, Kubernetes, CI/CD 실습 중심 스터디. 자격증 취득 병행.",
        "tags": ["클라우드", "Docker", "AWS", "DevOps", "Kubernetes", "백엔드"],
    },
    {
        "name": "데이터 엔지니어링 팀",
        "description": "Spark, Kafka, Airflow 등 데이터 파이프라인 구축 프로젝트 진행 중.",
        "tags": ["데이터엔지니어링", "Python", "Spark", "데이터분석", "SQL", "Airflow"],
    },
    {
        "name": "보안 CTF 팀",
        "description": "CTF 대회 참가 및 리버싱, 웹해킹, 암호학 스터디. 입문자도 환영.",
        "tags": ["보안", "CTF", "해킹", "리버싱", "암호학", "Linux"],
    },
    {
        "name": "자연어처리 NLP 연구회",
        "description": "LLM 파인튜닝, RAG, 프롬프트 엔지니어링 연구 및 프로젝트 팀.",
        "tags": ["NLP", "LLM", "AI", "Python", "GPT", "머신러닝", "데이터분석"],
    },
    {
        "name": "블록체인 & Web3 스터디",
        "description": "Solidity로 스마트컨트랙트 개발. DeFi, NFT 프로젝트 실습.",
        "tags": ["블록체인", "Web3", "Solidity", "Ethereum", "스마트컨트랙트"],
    },
    {
        "name": "iOS Swift 앱 개발 팀",
        "description": "Swift / SwiftUI로 iOS 앱 개발. 앱스토어 출시 경험 함께 만들어요.",
        "tags": ["iOS", "Swift", "앱개발", "모바일", "SwiftUI", "포트폴리오"],
    },
    {
        "name": "공모전 기획·개발 통합팀",
        "description": "SW 공모전 시즌에 빠르게 팀 꾸려 도전. 기획 1 + 디자인 1 + 개발 2 구성.",
        "tags": ["공모전", "기획", "웹개발", "UI/UX", "협업", "스타트업"],
    },
    {
        "name": "컴퓨터 비전 프로젝트",
        "description": "YOLO, OpenCV 기반 실시간 객체 탐지 프로젝트. Kaggle 대회도 병행.",
        "tags": ["컴퓨터비전", "딥러닝", "Python", "OpenCV", "AI", "Kaggle", "머신러닝"],
    },
]


def run():
    db = SessionLocal()
    try:
        # 첫 번째 유저를 owner로 사용
        owner = db.query(models.User).first()
        if not owner:
            print("유저 없음. 먼저 seed.py 실행 필요")
            return

        existing_names = {r.name for r in db.query(models.Room).all()}
        added = 0

        for r in NEW_ROOMS:
            if r["name"] in existing_names:
                print(f"  = 이미 존재: {r['name']}")
                continue
            room = models.Room(
                name=r["name"],
                description=r["description"],
                owner_id=owner.id,
            )
            db.add(room)
            db.flush()
            for tag in r["tags"]:
                db.add(models.RoomTag(room_id=room.id, tag=tag))
            db.add(models.RoomMember(room_id=room.id, user_id=owner.id))
            print(f"  + 추가: {r['name']}")
            added += 1

        db.commit()
        print(f"\n완료: {added}개 방 추가 (총 {db.query(models.Room).count()}개)")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run()
