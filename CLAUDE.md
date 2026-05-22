\# Team Match 프로젝트



\## 프로젝트 개요

AI 기반 대학생 팀 매칭 플랫폼. 사용자 분석 챗봇, 태그 자동생성, 방 추천, 활동 추천을 제공.



\## 기술 스택

\- Frontend: Next.js 15, Tailwind CSS, shadcn/ui, TypeScript

\- Backend: FastAPI, SQLAlchemy, SQLite (MVP), Pydantic

\- AI: Anthropic Claude API (claude-sonnet-4-6)

\- PDF: pdfplumber



\## 폴더 구조

\- /frontend  → Next.js 앱

\- /backend   → FastAPI 앱

&#x20; - /routers   → 라우터 (auth, users, rooms, analyze, recommend)

&#x20; - /services  → 비즈니스 로직 (ai\_service, tag\_service, recommend\_service, pdf\_service)

&#x20; - /db        → DB 모델 및 마이그레이션



\## 코딩 컨벤션

\- Python: snake\_case, type hint 필수, async/await 사용

\- TypeScript: 엄격한 타입, interface 우선, 함수형 컴포넌트

\- API 응답: { data, error, message } 구조 통일

\- 환경변수: .env 파일 사용, 절대 하드코딩 금지



\## 핵심 로직

\- 태그 매칭: Jaccard 유사도 기반 점수 계산

\- AI 사용: 태그 생성 및 추천 이유 문장 생성에만 사용 (점수 계산은 코드로)

\- 모든 AI 호출은 backend/services/ai\_service.py 에서만



\## 실행 방법

\- Backend: cd backend \&\& uvicorn main:app --reload

\- Frontend: cd frontend \&\& npm run dev

\- DB seed: cd backend \&\& python db/seed.py

