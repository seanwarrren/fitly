from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from app.routes import upload, garments, outfits
from app.db.mongodb import connect as db_connect, close as db_close
from app.services.cloudinary_service import init_cloudinary

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_connect()
    init_cloudinary()
    yield
    db_close()


app = FastAPI(title="fit.ly API", version="0.1.0", lifespan=lifespan)

origins = [
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
]
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


@app.get("/health")
async def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port)
