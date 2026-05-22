"""
크롤링 데이터 기반 활동 추가 (wevity.com 스타일)
python db/add_activities.py
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from db.database import SessionLocal
from db import models

# 방 이름 -> 활동 목록
NEW_ACTIVITIES = {
    "AI 해커톤 준비방": [
        {
            "title": "네이버 AI 해커톤 2025",
            "description": "네이버에서 주최하는 AI 서비스 개발 해커톤. 생성형 AI 활용 서비스 개발. 상금 총 1000만원.",
            "tags": ["AI", "해커톤", "머신러닝", "Python", "LLM"],
        },
        {
            "title": "카카오 AI 경진대회",
            "description": "카카오 데이터를 활용한 AI 모델 개발 대회. 추천시스템·NLP·비전 3개 트랙.",
            "tags": ["AI", "머신러닝", "딥러닝", "Python", "데이터분석"],
        },
    ],
    "부산 해커톤 팀": [
        {
            "title": "창업 아이디어톤 - 스마트시티",
            "description": "부산 스마트시티 혁신 아이디어를 겨루는 해커톤. 팀당 3~5인. 상금 500만원.",
            "tags": ["해커톤", "스타트업", "스마트시티", "기획", "웹개발"],
        },
    ],
    "웹 스터디 그룹": [
        {
            "title": "삼성 오픈소스 컨트리뷰션 아카데미",
            "description": "오픈소스 프로젝트 기여 경험을 쌓는 6개월 과정. React·Vue·Node 등 웹 분야 집중.",
            "tags": ["오픈소스", "React", "웹개발", "TypeScript", "협업"],
        },
        {
            "title": "구글 해시코드 팀 챌린지",
            "description": "구글이 주최하는 팀 코딩 챌린지. 알고리즘·웹·백엔드 복합 문제 해결.",
            "tags": ["웹개발", "백엔드", "알고리즘", "FastAPI", "협업"],
        },
    ],
    "데이터 사이언스 스터디": [
        {
            "title": "빅콘테스트 2025",
            "description": "한국정보화진흥원 주최 빅데이터 분석 경진대회. 공공데이터 활용. 상금 300만원.",
            "tags": ["데이터분석", "빅데이터", "Python", "Kaggle", "머신러닝"],
        },
        {
            "title": "Dacon 월간 데이터 경진대회",
            "description": "매월 열리는 국내 최대 데이터 사이언스 플랫폼 대회. 입문자 트랙 별도 운영.",
            "tags": ["데이터분석", "머신러닝", "Python", "Kaggle", "딥러닝"],
        },
    ],
    "공모전 준비 팀": [
        {
            "title": "SW 중심대학 공동 해커톤",
            "description": "전국 SW중심대학 연합 공모전. 사회문제 해결형 서비스 개발. 팀당 최대 5인.",
            "tags": ["공모전", "웹개발", "기획", "UI/UX", "백엔드"],
        },
    ],
    "AI 논문 읽기 스터디": [
        {
            "title": "ICLR 2025 논문 리뷰 세미나",
            "description": "국제 학술대회 최신 논문을 함께 읽고 발표하는 스터디. 주 1회 온라인 진행.",
            "tags": ["AI", "딥러닝", "논문", "머신러닝", "연구", "Python"],
        },
        {
            "title": "컴퓨터 비전 논문 구현 챌린지",
            "description": "최신 Vision 논문을 직접 구현하며 실력을 키우는 챌린지. PyTorch 사용.",
            "tags": ["딥러닝", "AI", "Python", "논문", "컴퓨터비전", "연구"],
        },
    ],
    "자연어처리 NLP 연구회": [
        {
            "title": "LLM 파인튜닝 해커톤",
            "description": "오픈소스 LLM을 파인튜닝해 특정 도메인 성능을 최적화하는 대회. GPU 지원.",
            "tags": ["NLP", "LLM", "AI", "Python", "머신러닝", "GPT"],
        },
        {
            "title": "한국어 NLP 경진대회",
            "description": "한국어 감성분석·요약·번역 태스크 AI 모델 개발 대회. KoBERT·KoGPT 활용.",
            "tags": ["NLP", "AI", "Python", "데이터분석", "머신러닝", "LLM"],
        },
    ],
    "웹 풀스택 프로젝트 팀": [
        {
            "title": "카카오 개발자 공모전",
            "description": "카카오 API를 활용한 서비스 개발 공모전. 웹·앱 모두 가능. 상금 200만원.",
            "tags": ["웹개발", "React", "FastAPI", "TypeScript", "풀스택"],
        },
    ],
    "알고리즘 코딩 테스트 준비": [
        {
            "title": "삼성 SW 역량 테스트 모의고사",
            "description": "삼성전자 공채 대비 알고리즘 모의테스트 및 피드백 세션. 매주 토요일 진행.",
            "tags": ["알고리즘", "코딩테스트", "Java", "Python", "취업"],
        },
        {
            "title": "ICPCKorea 팀 대회",
            "description": "국내 대학생 알고리즘 팀 프로그래밍 대회. 3인 1팀. 지역 예선 → 본선.",
            "tags": ["알고리즘", "자료구조", "코딩테스트", "Python", "Java"],
        },
    ],
    "게임 개발 인디 팀": [
        {
            "title": "글로벌 게임잼 2025",
            "description": "48시간 안에 인디 게임을 완성하는 글로벌 행사 국내 참가. Unity·Unreal 가능.",
            "tags": ["게임개발", "Unity", "인디게임", "C#", "그래픽"],
        },
    ],
    "클라우드 & DevOps 스터디": [
        {
            "title": "AWS 해커톤 - 클라우드 네이티브",
            "description": "AWS 서비스를 활용한 클라우드 네이티브 애플리케이션 개발 해커톤. 크레딧 지원.",
            "tags": ["AWS", "클라우드", "Docker", "DevOps", "백엔드"],
        },
    ],
    "보안 CTF 팀": [
        {
            "title": "코드게이트 CTF 2025",
            "description": "국내 최대 CTF 대회. 리버싱·웹해킹·암호학·포렌식 문제 출제. 상금 500만원.",
            "tags": ["CTF", "보안", "해킹", "리버싱", "암호학"],
        },
        {
            "title": "정보보안 취약점 분석 경진대회",
            "description": "실제 환경 유사 시스템의 취약점을 분석하는 대회. 화이트해커 대상.",
            "tags": ["보안", "CTF", "해킹", "Linux", "리버싱"],
        },
    ],
    "컴퓨터 비전 프로젝트": [
        {
            "title": "국방 AI 챌린지 - 영상 인식 트랙",
            "description": "국방과학연구소 주최 AI 대회. 객체탐지·분류 트랙. 상금 2000만원.",
            "tags": ["AI", "딥러닝", "컴퓨터비전", "Python", "Kaggle", "머신러닝"],
        },
    ],
    "창업 아이디어 발굴팀": [
        {
            "title": "K-스타트업 그랜드챌린지",
            "description": "중소벤처기업부 주최 창업 경진대회. 아이디어 → MVP 개발까지. 투자 연계.",
            "tags": ["창업", "스타트업", "기획", "MVP", "아이디어"],
        },
    ],
    "데이터 엔지니어링 팀": [
        {
            "title": "공공데이터 활용 해커톤",
            "description": "행정안전부 공공 빅데이터를 활용한 서비스 개발 해커톤. 데이터 파이프라인 구축 포함.",
            "tags": ["데이터엔지니어링", "Python", "SQL", "데이터분석", "Spark"],
        },
    ],
}


def run():
    db = SessionLocal()
    try:
        existing_titles = {a.title for a in db.query(models.Activity).all()}
        added = 0

        for room_name, activities in NEW_ACTIVITIES.items():
            room = db.query(models.Room).filter(models.Room.name == room_name).first()
            if not room:
                print(f"  ! 방 없음: {room_name}")
                continue

            for a in activities:
                if a["title"] in existing_titles:
                    print(f"  = 이미 존재: {a['title'][:30]}")
                    continue

                activity = models.Activity(
                    room_id=room.id,
                    title=a["title"],
                    description=a["description"],
                )
                db.add(activity)
                db.flush()
                for tag in a["tags"]:
                    db.add(models.ActivityTag(activity_id=activity.id, tag=tag))
                print(f"  + {a['title'][:40]}")
                added += 1

        db.commit()
        total = db.query(models.Activity).count()
        print(f"\n완료: {added}개 추가 (총 {total}개 활동)")
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run()
