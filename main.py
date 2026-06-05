from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware

from Keyholder.app import app as keyholder_app
from expense_tracker.main import app as expense_tracker_app
from video_compressor.app import app as vid_app

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "All services running"}

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
    vid_app
)
