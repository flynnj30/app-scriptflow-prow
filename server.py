from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from transcription_api.main import app as transcription_app

BASE_DIR = Path(__file__).resolve().parent

# The transcription API remains the same FastAPI application. We mount the
# existing ScriptFlow static files into that same origin so the browser can
# call /transcribe without a separate API hostname, CORS setup, or frontend
# proxy. Existing application routes/features remain in their original files.
app: FastAPI = transcription_app

# Static assets are mounted after the API routes so /health and /transcribe
# continue to be handled by FastAPI.
app.mount("/js", StaticFiles(directory=BASE_DIR / "js"), name="js")
app.mount("/assets", StaticFiles(directory=BASE_DIR / "assets"), name="assets") if (BASE_DIR / "assets").exists() else None

@app.get("/style.css", include_in_schema=False)
async def stylesheet():
    return FileResponse(BASE_DIR / "style.css", media_type="text/css")
