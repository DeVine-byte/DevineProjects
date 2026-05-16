from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# =====================
# USER SCHEMAS
# =====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr


# =====================
# TRANSACTION SCHEMAS
# =====================

class IncomeCreate(BaseModel):
    amount: float
    description: Optional[str] = None
    date: Optional[datetime] = None


class ExpenseCreate(BaseModel):
    amount: float
    category: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class TransactionOut(BaseModel):
    id: str
    type: str
    amount: float
    category: Optional[str]
    description: Optional[str]
    date: datetime
    user_id: str
