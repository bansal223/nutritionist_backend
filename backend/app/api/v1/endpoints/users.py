from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_user
from app.core.database import get_collection
from app.models.user import UserUpdate, UserResponse
from datetime import datetime

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_active_user)):
    """Get current user information."""
    return {
        "id": str(current_user["_id"]),
        "email": current_user["email"],
        "phone": current_user["phone"],
        "role": current_user["role"],
        "status": current_user["status"],
        "created_at": current_user["created_at"],
        "updated_at": current_user["updated_at"]
    }

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user = Depends(get_current_active_user)
):
    """Update current user information."""
    users_collection = get_collection("users")
    
    update_data = user_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    # Get updated user
    updated_user = await users_collection.find_one({"_id": current_user["_id"]})
    
    return {
        "id": str(updated_user["_id"]),
        "email": updated_user["email"],
        "phone": updated_user["phone"],
        "role": updated_user["role"],
        "status": updated_user["status"],
        "created_at": updated_user["created_at"],
        "updated_at": updated_user["updated_at"]
    } 