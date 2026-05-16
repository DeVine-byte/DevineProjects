from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware

# IMPORT FLASK APP
from Keyholder.app import app as keyholder_app

# IMPORT FASTAPI APP
from Expense_tracker.main import app as expense_tracker_app

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
            "Keyholder": "/Keyholder",
            "Expense Tracker": "/finance"
        }
    }

# MOUNT FLASK APP
app.mount(
    "/Keyholder",
    WSGIMiddleware(Keyholder_app)
)

# MOUNT FASTAPI APP
app.mount(
    "/finance",
    Expense_tracker_app
)
