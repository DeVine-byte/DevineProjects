# =========================
# IMPORTS
# =========================
from datetime import datetime
import secrets
import os

from fastapi import FastAPI, Depends, HTTPException, Request, Response
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.middleware import SlowAPIMiddleware

from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

from bson import ObjectId
from bson.errors import InvalidId

from .database import users_collection, transactions_collection

from .models import UserCreate, UserLogin, IncomeCreate, ExpenseCreate

from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)

from .services.report_service import generate_summary


# =========================
# APP INIT
# =========================
app = FastAPI()

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)


# =========================
# STARTUP
# =========================
@app.on_event("startup")
async def startup():
    FastAPICache.init(InMemoryBackend())


# =========================
# CORS
# =========================
#app.add_middleware(
#    CORSMiddleware,
  #  allow_origins=["*"],  # Change later to your domain
  #  allow_credentials=True,
  #  allow_methods=["*"],
 #   allow_headers=["*"],
#)


# =========================
# STATIC (SAFE)
# ========================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

frontend_path = os.path.join(BASE_DIR, "frontend")
index_path = os.path.join(frontend_path, "index.html")

# Serve static files
if os.path.exists(frontend_path):
    app.mount(
        "/static",
        StaticFiles(directory=frontend_path),
        name="static"
    )

# Serve frontend
@app.get("/")
def serve_frontend():
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"status": "API running"}

# =========================
# CSRF
# =========================
def verify_csrf(request: Request):
    cookie_token = request.cookies.get("csrf_token")
    header_token = request.headers.get("X-CSRF-Token")

    if not cookie_token or not header_token:
        raise HTTPException(status_code=403, detail="CSRF missing")

    if cookie_token != header_token:
        raise HTTPException(status_code=403, detail="Invalid CSRF token")


# =========================
# AUTH HELPERS
# =========================
async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token")

    try:
        user = await users_collection.find_one(
            {"_id": ObjectId(payload["sub"])}
        )
    except InvalidId:
        raise HTTPException(status_code=401, detail="Invalid user ID")

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return {"id": str(user["_id"]), "email": user["email"]}


# =========================
# AUTH ROUTES
# =========================
@app.get("/auth/me")
@limiter.limit("30/minute")
async def get_me(request: Request, user=Depends(get_current_user)):
    return user


@app.post("/auth/signup")
@limiter.limit("5/minute")
async def signup(request: Request, data: UserCreate, response: Response):
    existing = await users_collection.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")

    user = {
        "email": data.email,
        "password_hash": hash_password(data.password),
    }

    result = await users_collection.insert_one(user)

    access_token = create_access_token(str(result.inserted_id))
    refresh_token = create_refresh_token(str(result.inserted_id))
    csrf_token = secrets.token_urlsafe(32)

    response.set_cookie("access_token", access_token, httponly=True, samesite="Lax", secure=True)
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="Lax", secure=True)
    response.set_cookie("csrf_token", csrf_token, httponly=False, samesite="Lax", secure=True)

    return {"msg": "User created"}


@app.post("/auth/login")
@limiter.limit("5/minute")
async def login(request: Request, data: UserLogin, response: Response):
    user = await users_collection.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = str(user["_id"])

    access_token = create_access_token(user_id)
    refresh_token = create_refresh_token(user_id)
    csrf_token = secrets.token_urlsafe(32)

    response.set_cookie("access_token", access_token, httponly=True, samesite="Lax", secure=True)
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="Lax", secure=True)
    response.set_cookie("csrf_token", csrf_token, httponly=False, samesite="Lax", secure=True)

    return {"msg": "logged in"}


@app.post("/auth/refresh")
@limiter.limit("10/minute")
async def refresh_token(request: Request, response: Response):
    token = request.cookies.get("refresh_token")
    if not token:
        raise HTTPException(status_code=401, detail="No refresh token")

    payload = decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access = create_access_token(payload["sub"])

    response.set_cookie("access_token", new_access, httponly=True, samesite="Lax", secure=True)

    return {"msg": "refreshed"}


@app.post("/auth/logout")
@limiter.limit("10/minute")
async def logout(request: Request, response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("csrf_token")
    return {"msg": "logged out"}


# =========================
# TRANSACTIONS
# =========================
@app.post("/transactions/income")
@limiter.limit("20/minute")
async def add_income(request: Request, data: IncomeCreate, user=Depends(get_current_user)):
    transaction = {
        "type": "income",
        "amount": data.amount,
        "description": data.description,
        "date": data.date or datetime.utcnow(),
        "user_id": user["id"],
    }

    result = await transactions_collection.insert_one(transaction)
    FastAPICache.clear(namespace="summary")

    return {"id": str(result.inserted_id)}


@app.post("/transactions/expense")
@limiter.limit("20/minute")
async def add_expense(request: Request, data: ExpenseCreate, user=Depends(get_current_user)):
    transaction = {
        "type": "expense",
        "amount": data.amount,
        "category": data.category,
        "description": data.description,
        "date": data.date or datetime.utcnow(),
        "user_id": user["id"],
    }

    result = await transactions_collection.insert_one(transaction)
    FastAPICache.clear(namespace="summary")

    return {"id": str(result.inserted_id)}


@app.get("/transactions")
@limiter.limit("30/minute")
async def get_transactions(request: Request, user=Depends(get_current_user)):
    data = transactions_collection.find({"user_id": user["id"]})

    transactions = []
    async for doc in data:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        transactions.append(doc)

    return transactions


# =========================
# REPORTS
# =========================
@app.get("/reports/summary")
@limiter.limit("15/minute")
async def summary(request: Request, range: str, user=Depends(get_current_user)):
    return await generate_summary(range, user["id"])
