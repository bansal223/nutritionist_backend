from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    PATIENT = "patient"
    NUTRITIONIST = "nutritionist"
    ADMIN = "admin"

class UserStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"

class UserBase(BaseModel):
    email: EmailStr
    phone: str = Field(..., min_length=10, max_length=15)
    role: UserRole

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, min_length=10, max_length=15)
    status: Optional[UserStatus] = None

class UserInDB(UserBase):
    id: str = Field(alias="_id")
    password_hash: str
    status: UserStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    id: str
    status: UserStatus
    created_at: datetime
    updated_at: datetime

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[UserRole] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str 