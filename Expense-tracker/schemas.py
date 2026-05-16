from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict



# AUTH SCHEMAS

class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str



# TRANSACTIONS

class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None
    date: Optional[datetime] = None


class IncomeCreate(TransactionBase):
    pass


class ExpenseCreate(TransactionBase):
    category: str



class TransactionResponse(BaseModel):
    id: str
    type: str
    amount: float
    category: Optional[str] = None
    description: Optional[str] = None
    date: datetime



# REPORT

class ReportResponse(BaseModel):
    range: str
    total_income: float
    total_expense: float
    balance: float
    category_breakdown: Dict[str, float]
