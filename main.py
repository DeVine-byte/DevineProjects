from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from Keyholder.app import app as keyholder_app
from expense_tracker.main import app as expense_tracker_app
from videoCompressor.app import app as vid_app

app = FastAPI(
    title="Community Utility Hub",
    description="A collection of free community tools.",
    version="1.0.0"
)

app.mount(
    "/static",
    StaticFiles(directory="frontend"),
    name="static"
)


@app.get("/", include_in_schema=False)
async def home():
    return FileResponse("frontend/index.html")

APPS = [
    {
        "name": "Keyholder",
        "url": "/keyholder",
        "category": "Security",
        "status": "Live",
        "description":
            "Security-focused password management platform."
    },
    {
        "name": "Expense Tracker",
        "url": "/finance",
        "category": "Finance",
        "status": "Live",
        "description":
            "Personal finance dashboard with analytics."
    },
    {
        "name": "Video Compressor",
        "url": "/videoCompressor",
        "category": "Media",
        "status": "Live",
        "description":
            "FFmpeg-powered video compression."
    }
]


@app.get("/api/apps")
async def get_apps():
    return APPS


@app.get("/api/stats")
async def get_stats():
    return {
        "tools": len(APPS),
        "free": True,
        "status": "Operational"
    }


@app.get("/health")
async def health():
    return {
        "hub": "online",
        "keyholder": "online",
        "finance": "online",
        "videoCompressor": "online"
    }

app.mount(
    "/keyholder",
    WSGIMiddleware(keyholder_app)
)

app.mount(
    "/finance",
    expense_tracker_app
)

app.mount(
    "/videoCompressor",
    WSGIMiddleware(vid_app)
)
