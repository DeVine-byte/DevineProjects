from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware

# IMPORT FLASK APP
from keyholder.app import app as keyholder_app

# IMPORT FASTAPI APP
from expense_tracker.main import app as expense_tracker_app

# MAIN APP
app = FastAPI(
    title="Combined Multi-App Service"
)

# ROOT ROUTE
@app.get("/")
async def root():
    return {
        "message": "All services running",
        "services": {
            "Keyholder": "/keyholder",
            "Expense Tracker": "/finance"
        }
    }

# MOUNT FLASK APP
app.mount(
    "/keyholder",
    WSGIMiddleware(keyholder_app)
)

# MOUNT FASTAPI APP
app.mount(
    "/finance",
    expense_tracker_app
)
