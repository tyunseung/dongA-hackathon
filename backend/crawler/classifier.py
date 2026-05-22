# 제목 + 설명 텍스트에서 field, difficulty, beginner_ok 자동 판별

FIELD_KEYWORDS = {
    "AI":       ["AI", "인공지능", "머신러닝", "딥러닝", "LLM", "GPT", "데이터"],
    "백엔드":   ["백엔드", "서버", "API", "Spring", "Django", "FastAPI", "Node"],
    "프론트엔드": ["프론트엔드", "React", "Vue", "Next.js", "UI", "웹"],
    "앱":       ["앱", "iOS", "Android", "Flutter", "React Native", "모바일"],
    "디자인":   ["디자인", "UX", "UI", "그래픽", "브랜딩"],
    "기획":     ["기획", "PM", "서비스", "아이디어"],
    "마케팅":   ["마케팅", "SNS", "홍보", "콘텐츠"],
    "창업":     ["창업", "스타트업", "사업화"],
}

BEGINNER_KEYWORDS = ["누구나", "전공무관", "초보", "입문", "비전공", "무관"]
ADVANCED_KEYWORDS = ["수상 실적", "포트폴리오 필수", "관련 경력", "경험자 우대"]

def classify(title: str, description: str) -> dict:
    text = f"{title} {description}".upper()
    
    fields = [f for f, kws in FIELD_KEYWORDS.items()
              if any(kw.upper() in text for kw in kws)]
    
    beginner_ok = any(kw in text for kw in BEGINNER_KEYWORDS)
    is_advanced = any(kw in text for kw in ADVANCED_KEYWORDS)
    
    difficulty = "advanced" if is_advanced else ("beginner" if beginner_ok else "intermediate")
    
    return {
        "field": fields or ["기타"],
        "beginner_ok": beginner_ok,
        "difficulty": difficulty,
    }