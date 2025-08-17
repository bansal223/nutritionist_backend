from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_user
from app.core.database import get_collection
from app.models.subscription import SubscriptionCreate, SubscriptionResponse, PaymentOrder, PaymentResponse
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

@router.post("/create-order", response_model=PaymentResponse)
async def create_payment_order(
    payment_data: PaymentOrder,
    current_user = Depends(get_current_active_user)
):
    """Create a payment order."""
    # In a real implementation, this would integrate with Razorpay/Stripe
    # For now, we'll create a mock response
    
    import uuid
    
    order_id = str(uuid.uuid4())
    
    return {
        "order_id": order_id,
        "amount": payment_data.amount,
        "currency": payment_data.currency,
        "payment_url": f"https://example.com/pay/{order_id}"
    }

@router.post("/", response_model=SubscriptionResponse)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user = Depends(get_current_active_user)
):
    """Create a new subscription."""
    subscriptions_collection = get_collection("subscriptions")
    
    # Check if user already has an active subscription
    existing_subscription = await subscriptions_collection.find_one({
        "user_id": current_user["_id"],
        "status": "active"
    })
    
    if existing_subscription:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has an active subscription"
        )
    
    # Create subscription
    subscription_doc = {
        "user_id": current_user["_id"],
        "plan": subscription_data.plan,
        "price_inr": subscription_data.price_inr,
        "status": subscription_data.status,
        "current_period_start": subscription_data.current_period_start,
        "current_period_end": subscription_data.current_period_end,
        "gateway_customer_id": subscription_data.gateway_customer_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await subscriptions_collection.insert_one(subscription_doc)
    subscription_doc["_id"] = result.inserted_id
    
    return {
        "id": str(subscription_doc["_id"]),
        "user_id": str(subscription_doc["user_id"]),
        "plan": subscription_doc["plan"],
        "price_inr": subscription_doc["price_inr"],
        "status": subscription_doc["status"],
        "current_period_start": subscription_doc["current_period_start"],
        "current_period_end": subscription_doc["current_period_end"],
        "gateway_customer_id": subscription_doc["gateway_customer_id"],
        "created_at": subscription_doc["created_at"].isoformat(),
        "updated_at": subscription_doc["updated_at"].isoformat()
    }

@router.get("/", response_model=List[SubscriptionResponse])
async def get_user_subscriptions(
    current_user = Depends(get_current_active_user),
    limit: int = 10,
    skip: int = 0
):
    """Get user's subscriptions."""
    subscriptions_collection = get_collection("subscriptions")
    
    cursor = subscriptions_collection.find(
        {"user_id": current_user["_id"]},
        sort=[("created_at", -1)]
    ).skip(skip).limit(limit)
    
    subscriptions = []
    async for subscription in cursor:
        subscriptions.append({
            "id": str(subscription["_id"]),
            "user_id": str(subscription["user_id"]),
            "plan": subscription["plan"],
            "price_inr": subscription["price_inr"],
            "status": subscription["status"],
            "current_period_start": subscription["current_period_start"],
            "current_period_end": subscription["current_period_end"],
            "gateway_customer_id": subscription["gateway_customer_id"],
            "created_at": subscription["created_at"].isoformat(),
            "updated_at": subscription["updated_at"].isoformat()
        })
    
    return subscriptions

@router.get("/current", response_model=SubscriptionResponse)
async def get_current_subscription(current_user = Depends(get_current_active_user)):
    """Get user's current active subscription."""
    subscriptions_collection = get_collection("subscriptions")
    
    subscription = await subscriptions_collection.find_one({
        "user_id": current_user["_id"],
        "status": "active"
    })
    
    if not subscription:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active subscription found"
        )
    
    return {
        "id": str(subscription["_id"]),
        "user_id": str(subscription["user_id"]),
        "plan": subscription["plan"],
        "price_inr": subscription["price_inr"],
        "status": subscription["status"],
        "current_period_start": subscription["current_period_start"],
        "current_period_end": subscription["current_period_end"],
        "gateway_customer_id": subscription["gateway_customer_id"],
        "created_at": subscription["created_at"].isoformat(),
        "updated_at": subscription["updated_at"].isoformat()
    }

@router.post("/webhooks/payment")
async def payment_webhook():
    """Handle payment webhooks from payment gateway."""
    # In a real implementation, this would verify the webhook signature
    # and update subscription status based on payment events
    
    return {"status": "success"} 