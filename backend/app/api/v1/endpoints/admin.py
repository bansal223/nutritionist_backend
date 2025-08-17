from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_admin
from app.core.database import get_collection
from app.models.user import UserResponse, UserUpdate
from app.models.profile import NutritionistProfileUpdate
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List, Dict

router = APIRouter()

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    current_user = Depends(get_current_admin),
    role: str = None,
    status: str = None,
    limit: int = 50,
    skip: int = 0
):
    """Get all users with optional filtering."""
    users_collection = get_collection("users")
    
    # Build query
    query = {}
    if role:
        query["role"] = role
    if status:
        query["status"] = status
    
    cursor = users_collection.find(query, sort=[("created_at", -1)]).skip(skip).limit(limit)
    
    users = []
    async for user in cursor:
        users.append({
            "id": str(user["_id"]),
            "email": user["email"],
            "phone": user["phone"],
            "role": user["role"],
            "status": user["status"],
            "created_at": user["created_at"],
            "updated_at": user["updated_at"]
        })
    
    return users

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user = Depends(get_current_admin)
):
    """Update user information."""
    users_collection = get_collection("users")
    
    # Check if user exists
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user
    update_data = user_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await users_collection.find_one({"_id": ObjectId(user_id)})
    
    return {
        "id": str(updated_user["_id"]),
        "email": updated_user["email"],
        "phone": updated_user["phone"],
        "role": updated_user["role"],
        "status": updated_user["status"],
        "created_at": updated_user["created_at"],
        "updated_at": updated_user["updated_at"]
    }

@router.post("/nutritionists/{nutritionist_id}/verify")
async def verify_nutritionist(
    nutritionist_id: str,
    current_user = Depends(get_current_admin)
):
    """Verify a nutritionist profile."""
    nutritionist_profiles_collection = get_collection("nutritionist_profiles")
    
    # Check if nutritionist profile exists
    profile = await nutritionist_profiles_collection.find_one({"user_id": ObjectId(nutritionist_id)})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nutritionist profile not found"
        )
    
    # Update verification status
    await nutritionist_profiles_collection.update_one(
        {"user_id": ObjectId(nutritionist_id)},
        {"$set": {"verified": True, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Nutritionist verified successfully"}

@router.get("/metrics", response_model=Dict)
async def get_platform_metrics(current_user = Depends(get_current_admin)):
    """Get platform metrics and analytics."""
    users_collection = get_collection("users")
    subscriptions_collection = get_collection("subscriptions")
    meal_plans_collection = get_collection("meal_plans")
    progress_collection = get_collection("progress_reports")
    
    # Get user counts by role
    patient_count = await users_collection.count_documents({"role": "patient"})
    nutritionist_count = await users_collection.count_documents({"role": "nutritionist"})
    admin_count = await users_collection.count_documents({"role": "admin"})
    
    # Get subscription metrics
    active_subscriptions = await subscriptions_collection.count_documents({"status": "active"})
    total_revenue = 0  # This would be calculated from actual payment data
    
    # Get meal plan metrics
    total_meal_plans = await meal_plans_collection.count_documents({})
    published_meal_plans = await meal_plans_collection.count_documents({"status": "published"})
    
    # Get progress metrics
    total_progress_reports = await progress_collection.count_documents({})
    
    # Get recent activity
    recent_users = await users_collection.count_documents({
        "created_at": {"$gte": datetime.utcnow() - timedelta(days=30)}
    })
    
    return {
        "users": {
            "total_patients": patient_count,
            "total_nutritionists": nutritionist_count,
            "total_admins": admin_count,
            "recent_signups_30d": recent_users
        },
        "subscriptions": {
            "active_subscriptions": active_subscriptions,
            "total_revenue": total_revenue
        },
        "meal_plans": {
            "total_meal_plans": total_meal_plans,
            "published_meal_plans": published_meal_plans
        },
        "progress": {
            "total_progress_reports": total_progress_reports
        }
    }

@router.get("/nutritionists/pending", response_model=List[Dict])
async def get_pending_nutritionists(
    current_user = Depends(get_current_admin),
    limit: int = 20,
    skip: int = 0
):
    """Get nutritionists pending verification."""
    nutritionist_profiles_collection = get_collection("nutritionist_profiles")
    users_collection = get_collection("users")
    
    cursor = nutritionist_profiles_collection.find(
        {"verified": False},
        sort=[("created_at", -1)]
    ).skip(skip).limit(limit)
    
    pending_nutritionists = []
    async for profile in cursor:
        # Get user info
        user = await users_collection.find_one({"_id": profile["user_id"]})
        if user:
            pending_nutritionists.append({
                "user_id": str(profile["user_id"]),
                "email": user["email"],
                "registration_no": profile["registration_no"],
                "qualifications": profile["qualifications"],
                "years_experience": profile["years_experience"],
                "rate_week_inr": profile["rate_week_inr"],
                "created_at": profile["created_at"]
            })
    
    return pending_nutritionists 