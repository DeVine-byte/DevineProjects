from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware

# IMPORT FLASK APPS
from blog_app.app import app as blog_flask_app
from password_manager.app import app as password_flask_app

# IMPORT FASTAPI APP
from finance_api.main import app as finance_fastapi_app

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
            "Expense-tracker": "/finance"
        }
    }

# MOUNT FLASK APPS


app.mount(
    "/Keyholder",
    WSGIMiddleware(Keyholder)
)

# MOUNT FASTAPI APP
app.mount("/finance", Expense-tracker)
