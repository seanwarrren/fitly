from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

from app.routes import upload, garments, outfits
from app.services.image_service import ensure_upload_dirs
from app.db.mongodb import connect as db_connect, close as db_close

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_connect()
    yield
    db_close()


app = FastAPI(title="fit.ly API", version="0.1.0", lifespan=lifespan)

origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]
# Also allow localhost during development regardless
if "http://localhost:3000" not in origins:
    origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(garments.router)
app.include_router(outfits.router)

ensure_upload_dirs()
uploads_path = Path(__file__).resolve().parent.parent / "uploads"
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
