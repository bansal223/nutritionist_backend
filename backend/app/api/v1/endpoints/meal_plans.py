from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_nutritionist
from app.core.database import get_collection
from app.models.meal_plan import MealPlanCreate, MealPlanUpdate, MealPlanResponse, MealPlanSummary
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/", response_model=MealPlanResponse)
async def create_meal_plan(
    meal_plan_data: MealPlanCreate,
    current_user = Depends(get_current_nutritionist)
):
    """Create a new meal plan."""
    meal_plans_collection = get_collection("meal_plans")
    assignments_collection = get_collection("assignments")
    
    # Verify assignment
    assignment = await assignments_collection.find_one({
        "nutritionist_id": current_user["_id"],
        "patient_id": ObjectId(meal_plan_data.patient_id),
        "active": True
    })
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not assigned to this nutritionist"
        )
    
    # Check if meal plan already exists for this week
    existing_plan = await meal_plans_collection.find_one({
        "patient_id": ObjectId(meal_plan_data.patient_id),
        "week_start": datetime.combine(meal_plan_data.week_start, datetime.min.time())  # Convert date to datetime for query
    })
    
    if existing_plan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Meal plan already exists for this week"
        )
    
    # Create meal plan
    meal_plan_doc = {
        "patient_id": ObjectId(meal_plan_data.patient_id),
        "nutritionist_id": current_user["_id"],
        "week_start": datetime.combine(meal_plan_data.week_start, datetime.min.time()),  # Convert date to datetime
        "notes": meal_plan_data.notes,
        "status": meal_plan_data.status,
        "days": [day.dict() for day in meal_plan_data.days],  # Convert Pydantic models to dictionaries
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await meal_plans_collection.insert_one(meal_plan_doc)
    meal_plan_doc["_id"] = result.inserted_id
    
    return {
        "id": str(meal_plan_doc["_id"]),
        "patient_id": str(meal_plan_doc["patient_id"]),
        "nutritionist_id": str(meal_plan_doc["nutritionist_id"]),
        "week_start": meal_plan_doc["week_start"].date() if isinstance(meal_plan_doc["week_start"], datetime) else meal_plan_doc["week_start"],
        "notes": meal_plan_doc["notes"],
        "status": meal_plan_doc["status"],
        "days": meal_plan_doc["days"],
        "created_at": meal_plan_doc["created_at"].isoformat(),
        "updated_at": meal_plan_doc["updated_at"].isoformat()
    }

@router.put("/{meal_plan_id}", response_model=MealPlanResponse)
async def update_meal_plan(
    meal_plan_id: str,
    meal_plan_data: MealPlanUpdate,
    current_user = Depends(get_current_nutritionist)
):
    """Update a meal plan."""
    meal_plans_collection = get_collection("meal_plans")
    
    # Get meal plan
    meal_plan = await meal_plans_collection.find_one({
        "_id": ObjectId(meal_plan_id),
        "nutritionist_id": current_user["_id"]
    })
    
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    # Update meal plan
    update_data = meal_plan_data.dict(exclude_unset=True)
    
    # Convert days to dictionaries if present
    if "days" in update_data and update_data["days"]:
        update_data["days"] = [day.dict() for day in update_data["days"]]
    
    update_data["updated_at"] = datetime.utcnow()
    
    await meal_plans_collection.update_one(
        {"_id": ObjectId(meal_plan_id)},
        {"$set": update_data}
    )
    
    # Get updated meal plan
    updated_plan = await meal_plans_collection.find_one({"_id": ObjectId(meal_plan_id)})
    
    return {
        "id": str(updated_plan["_id"]),
        "patient_id": str(updated_plan["patient_id"]),
        "nutritionist_id": str(updated_plan["nutritionist_id"]),
        "week_start": updated_plan["week_start"].date() if isinstance(updated_plan["week_start"], datetime) else updated_plan["week_start"],
        "notes": updated_plan.get("notes"),
        "status": updated_plan["status"],
        "days": updated_plan["days"],
        "created_at": updated_plan["created_at"].isoformat(),
        "updated_at": updated_plan["updated_at"].isoformat()
    }

@router.get("/", response_model=List[MealPlanSummary])
async def get_meal_plans(
    current_user = Depends(get_current_nutritionist),
    patient_id: str = None,
    limit: int = 20,
    skip: int = 0
):
    """Get meal plans created by the nutritionist."""
    meal_plans_collection = get_collection("meal_plans")
    
    # Build query
    query = {"nutritionist_id": current_user["_id"]}
    if patient_id:
        query["patient_id"] = ObjectId(patient_id)
    
    cursor = meal_plans_collection.find(query, sort=[("week_start", -1)]).skip(skip).limit(limit)
    
    meal_plans = []
    async for plan in cursor:
        # Calculate totals
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        
        for day in plan["days"]:
            for meal in day["meals"]:
                total_calories += meal["calories"]
                total_protein += meal["protein_g"]
                total_carbs += meal["carbs_g"]
                total_fat += meal["fat_g"]
        
        meal_plans.append({
            "id": str(plan["_id"]),
            "patient_id": str(plan["patient_id"]),
            "nutritionist_id": str(plan["nutritionist_id"]),
            "week_start": plan["week_start"].date() if isinstance(plan["week_start"], datetime) else plan["week_start"],
            "status": plan["status"],
            "total_calories": total_calories,
            "total_protein": total_protein,
            "total_carbs": total_carbs,
            "total_fat": total_fat
        })
    
    return meal_plans

@router.get("/{meal_plan_id}", response_model=MealPlanResponse)
async def get_meal_plan(
    meal_plan_id: str,
    current_user = Depends(get_current_nutritionist)
):
    """Get a specific meal plan."""
    meal_plans_collection = get_collection("meal_plans")
    
    meal_plan = await meal_plans_collection.find_one({
        "_id": ObjectId(meal_plan_id),
        "nutritionist_id": current_user["_id"]
    })
    
    if not meal_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal plan not found"
        )
    
    return {
        "id": str(meal_plan["_id"]),
        "patient_id": str(meal_plan["patient_id"]),
        "nutritionist_id": str(meal_plan["nutritionist_id"]),
        "week_start": meal_plan["week_start"].date() if isinstance(meal_plan["week_start"], datetime) else meal_plan["week_start"],
        "notes": meal_plan.get("notes"),
        "status": meal_plan["status"],
        "days": meal_plan["days"],
        "created_at": meal_plan["created_at"].isoformat(),
        "updated_at": meal_plan["updated_at"].isoformat()
    } 