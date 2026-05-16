from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware

from Keyholder.app import app as keyholder_app
from expense_tracker.main import app as expense_tracker_app

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
