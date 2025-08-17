from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class SubscriptionPlan(str, Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    CONSULT = "consult"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    EXPIRED = "expired"
    PENDING = "pending"

class SubscriptionBase(BaseModel):
    user_id: str
    plan: SubscriptionPlan
    price_inr: float = Field(..., gt=0)
    status: SubscriptionStatus = SubscriptionStatus.PENDING
    current_period_start: datetime
    current_period_end: datetime
    gateway_customer_id: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    status: Optional[SubscriptionStatus] = None
    current_period_end: Optional[datetime] = None
    gateway_customer_id: Optional[str] = None

class SubscriptionResponse(SubscriptionBase):
    id: str
    created_at: str
    updated_at: str

class PaymentOrder(BaseModel):
    amount: float
    currency: str = "INR"
    receipt: str
    notes: Optional[str] = None

class PaymentResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    payment_url: str 