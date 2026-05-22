import io

import pdfplumber
from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from services import ai_service

router = APIRouter()

PDF_TEXT_LIMIT = 8000


class ChatRequest(BaseModel):
    messages: list[dict]


class ConversationRequest(BaseModel):
    conversation: list[dict]


@router.post("/chat")
async def chat(req: ChatRequest):
    response = await ai_service.chat(req.messages)
    return {"response": response}


@router.post("/generate-tags")
async def generate_tags(req: ConversationRequest):
    tags = await ai_service.generate_tags_from_conversation(req.conversation)
    return {"tags": tags}


@router.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="PDF 파일만 업로드 가능합니다")

    content = await file.read()
    with pdfplumber.open(io.BytesIO(content)) as pdf:
        text = "\n".join(page.extract_text() or "" for page in pdf.pages)

    truncated = text[:PDF_TEXT_LIMIT]
    messages = [{"role": "user", "content": f"다음 PDF 내용을 분석해주세요:\n\n{truncated}"}]
    response = await ai_service.chat(messages)
    return {"response": response, "extracted_text": truncated}