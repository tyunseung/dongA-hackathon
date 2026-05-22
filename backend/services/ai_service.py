import os
import re
import json
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()

# --- Anthropic (commented out) ---
# import anthropic
# client = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
# MODEL = "claude-sonnet-4-6"
# async def _call_anthropic(system, messages, max_tokens):
#     response = await client.messages.create(
#         model=MODEL, max_tokens=max_tokens, system=system, messages=messages
#     )
#     return response.content[0].text

client = AsyncGroq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.1-8b-instant"

SYSTEM_PROMPT = (
    "당신은 팀 프로젝트 매칭 플랫폼의 AI 어시스턴트입니다. "
    "사용자의 관심사, 기술 스택, 목표를 파악해 최적의 팀과 활동을 추천합니다. "
    "반드시 한국어로 답변하고, 기술 용어(React, Python 등)는 영어 그대로 사용하세요. "
    "한자·일본어·러시아어 등 한국어·영어 외 문자는 절대 사용하지 마세요. "
    "답변은 2~3문장으로 간결하게 유지하세요."
)


def _clean_text(text: str) -> str:
    """Remove all characters outside Korean/English/numbers/common punctuation."""
    return re.sub(
        r"[^가-힣ᄀ-ᇿ㄰-㆏"
        r"a-zA-Z0-9\s\.,!?\-_():;'\"/\[\]%@#&*+<>=~`^\\|{}\n]",
        "",
        text,
    )


async def _call(system: str, messages: list[dict], max_tokens: int) -> str:
    prefix = [{"role": "system", "content": system}] if system else []
    trimmed = list(messages)
    while trimmed and trimmed[0]["role"] != "user":
        trimmed.pop(0)
    response = await client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        messages=prefix + trimmed,
    )
    return _clean_text(response.choices[0].message.content)


async def chat(messages: list[dict]) -> str:
    return await _call(SYSTEM_PROMPT, messages, max_tokens=1024)


async def generate_tags_from_conversation(conversation: list[dict]) -> list[str]:
    prompt = (
        "Analyze the conversation below and extract tags representing the user's interests, "
        "skills, and goals. Return ONLY a JSON array of short Korean or English tags. "
        "Example: [\"Python\", \"머신러닝\", \"스타트업\"]\n\n"
        "Conversation:\n" + json.dumps(conversation, ensure_ascii=False)
    )
    text = await _call("", [{"role": "user", "content": prompt}], max_tokens=512)
    text = text.strip()
    start, end = text.find("["), text.rfind("]")
    if start != -1 and end != -1:
        return json.loads(text[start: end + 1])
    return []


async def generate_recommendation_reason(
    user_tags: list[str],
    target_tags: list[str],
    target_description: str,
) -> str:
    prompt = (
        f"사용자 태그: {json.dumps(user_tags, ensure_ascii=False)}\n"
        f"대상 태그: {json.dumps(target_tags, ensure_ascii=False)}\n"
        f"대상 설명: {target_description}\n\n"
        "위 정보를 바탕으로 이 추천이 사용자에게 맞는 이유를 한국어로 딱 한 문장(20자 이내)으로만 답하세요. "
        "다른 말은 절대 추가하지 마세요."
    )
    return await _call("", [{"role": "user", "content": prompt}], max_tokens=60)


async def analyze_team_status(members_data: list[dict]) -> dict:
    prompt = (
        "Analyze the team member data below and return a JSON object.\n"
        "Format: {\"summary\": \"overall summary\", \"strengths\": [\"strength1\", ...], "
        "\"gaps\": [\"gap1\", ...], \"diversity_score\": 0.0-1.0}\n\n"
        "Team data:\n" + json.dumps(members_data, ensure_ascii=False)
    )
    text = await _call("", [{"role": "user", "content": prompt}], max_tokens=1024)
    text = text.strip()
    start, end = text.find("{"), text.rfind("}")
    if start != -1 and end != -1:
        return json.loads(text[start: end + 1])
    return {"summary": text, "strengths": [], "gaps": [], "diversity_score": 0.0}
