from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

from Keyholder.app import app as keyholder_app
from expense_tracker.main import app as expense_tracker_app
from videoCompressor.app import app as vid_app

app = FastAPI()



@app.get("/", response_class=HTMLResponse)
async def home():
    with open("frontend/index.html") as f:
        return f.read()

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
