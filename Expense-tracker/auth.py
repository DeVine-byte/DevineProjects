from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException
import os


SECRET = os.getenv("SECRET_KEY", "dev_secret_change_me")
ALGO = "HS256"

ACCESS_EXPIRE_MINUTES = 15
REFRESH_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")



# PASSWORDS


MAX_PASSWORD_BYTES = 72


def validate_password(password: str):
    if len(password.encode("utf-8")) > MAX_PASSWORD_BYTES:
        raise HTTPException(
            status_code=400,
            detail="Password is too long (max 72 bytes for bcrypt)"
        )


def hash_password(password: str) -> str:
    validate_password(password)
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    validate_password(password)
    return pwd_context.verify(password, hashed)



# JWT TOKENS


def create_access_token(user_id: str) -> str:
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_EXPIRE_MINUTES)
    }

    return jwt.encode(payload, SECRET, algorithm=ALGO)


def create_refresh_token(user_id: str) -> str:
    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.utcnow() + timedelta(days=REFRESH_EXPIRE_DAYS)
    }

    return jwt.encode(payload, SECRET, algorithm=ALGO)


def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET, algorithms=[ALGO])

    except JWTError:
        return None
