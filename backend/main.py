from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from db.database import engine
from db import models

load_dotenv()

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Hackathon API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routers import auth, users, analyze, rooms, recommend, activities

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(analyze.router, prefix="/api/analyze", tags=["analyze"])
app.include_router(rooms.router, prefix="/api/rooms", tags=["rooms"])
app.include_router(recommend.router, prefix="/api/recommend", tags=["recommend"])
app.include_router(activities.router, prefix="/api/activities", tags=["activities"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
