import os
import json
import anthropic

client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
MODEL = "claude-sonnet-4-6"

SYSTEM_PROMPT = (
    "당신은 팀 프로젝트 매칭 플랫폼의 AI 어시스턴트입니다. "
    "사용자의 관심사, 기술, 목표를 파악하여 최적의 팀과 활동을 추천해줍니다. "
    "항상 한국어로 친절하고 간결하게 답변하세요."
)


async def chat(messages: list[dict]) -> str:
    response = await client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    return response.content[0].text


async def generate_tags_from_conversation(conversation: list[dict]) -> list[str]:
    prompt = (
        "아래 대화를 분석하여 사용자의 관심사, 기술, 목표를 나타내는 태그를 추출하세요. "
        "태그는 짧은 단어나 구문으로 구성하며, JSON 배열 형식으로만 반환하세요. 예: [\"Python\", \"머신러닝\", \"스타트업\"]\n\n"
        "대화:\n" + json.dumps(conversation, ensure_ascii=False)
    )
    response = await client.messages.create(
        model=MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text.strip()
    start, end = text.find("["), text.rfind("]")
    if start != -1 and end != -1:
        return json.loads(text[start : end + 1])
    return []


async def generate_recommendation_reason(
    user_tags: list[str],
    target_tags: list[str],
    target_description: str,
) -> str:
    prompt = (
        f"사용자 태그: {json.dumps(user_tags, ensure_ascii=False)}\n"
        f"추천 대상 태그: {json.dumps(target_tags, ensure_ascii=False)}\n"
        f"추천 대상 설명: {target_description}\n\n"
        "위 정보를 바탕으로 이 추천이 사용자에게 적합한 이유를 1-2문장으로 작성하세요."
    )
    response = await client.messages.create(
        model=MODEL,
        max_tokens=256,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text.strip()


async def analyze_team_status(members_data: list[dict]) -> dict:
    prompt = (
        "다음 팀원 데이터를 분석하여 팀 구성 현황을 JSON 형식으로 반환하세요.\n"
        "반환 형식: {\"summary\": \"전체 요약\", \"strengths\": [\"강점1\", ...], "
        "\"gaps\": [\"부족한 역량1\", ...], \"diversity_score\": 0.0~1.0}\n\n"
        "팀원 데이터:\n" + json.dumps(members_data, ensure_ascii=False)
    )
    response = await client.messages.create(
        model=MODEL,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    text = response.content[0].text.strip()
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        return json.loads(text[start : end + 1])
    return {"summary": text, "strengths": [], "gaps": [], "diversity_score": 0.0}
