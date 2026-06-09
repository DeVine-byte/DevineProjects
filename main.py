#import modules 

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


# Static Files


app.mount(
    "/static",
    StaticFiles(directory="frontend"),
    name="static"
)


@app.get("/", include_in_schema=False)
async def home():
    return FileResponse("frontend/index.html")


# App Registry

REGISTERED_APPS = []


def register_app(
    *,
    path: str,
    application,
    name: str,
    description: str,
    category: str,
    icon: str,
    wsgi: bool = False
):

    if wsgi:
        app.mount(
            path,
            WSGIMiddleware(application)
        )
    else:
        app.mount(
            path,
            application
        )

    REGISTERED_APPS.append(
        {
            "name": name,
            "url": path,
            "description": description,
            "category": category,
            "icon": icon,
            "status": "Live"
        }
    )


# Register Community Apps

register_app(
    path="/keyholder",
    application=keyholder_app,
    name="Keyholder",
    description="Security-focused password management platform.",
    category="Security",
    icon="🔐",
    wsgi=True
)

register_app(
    path="/finance",
    application=expense_tracker_app,
    name="Expense Tracker",
    description="Personal finance dashboard with analytics.",
    category="Finance",
    icon="📊"
)

register_app(
    path="/videoCompressor",
    application=vid_app,
    name="Video Compressor",
    description="FFmpeg-powered video compression.",
    category="Media",
    icon="🎥",
    wsgi=True
)


# APIs

@app.get("/api/apps")
async def get_apps():
    return REGISTERED_APPS


@app.get("/api/stats")
async def get_stats():

    return {
        "tools": len(REGISTERED_APPS),
        "free": True,
        "status": "Operational"
    }


@app.get("/health")
async def health():

    return {
        "hub": "online",
        "services": len(REGISTERED_APPS),
        "apps": [
            app["name"]
            for app in REGISTERED_APPS
        ]
    }
