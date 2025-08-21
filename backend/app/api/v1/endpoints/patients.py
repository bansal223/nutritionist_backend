from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_patient
from app.core.database import get_collection
from app.models.profile import PatientProfileCreate, PatientProfileUpdate, PatientProfileResponse, DietaryPreference
from app.models.meal_plan import MealPlanResponse
from app.models.progress import ProgressReportCreate, ProgressReportResponse
from bson import ObjectId
from datetime import datetime, date
from typing import List

router = APIRouter()

@router.post("/profile", response_model=PatientProfileResponse)
async def create_patient_profile(
    profile_data: PatientProfileCreate,
    current_user = Depends(get_current_patient)
):
    """Create a new patient profile."""
    patient_profiles_collection = get_collection("patient_profiles")
    
    # Check if profile already exists
    existing_profile = await patient_profiles_collection.find_one({"user_id": current_user["_id"]})
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT /profile to update."
        )
    
    # Validate dietary preferences
    if profile_data.dietary_prefs:
        valid_prefs = [pref.value for pref in DietaryPreference]
        for pref in profile_data.dietary_prefs:
            if pref not in valid_prefs:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid dietary preference: {pref}. Valid options: {valid_prefs}"
                )
    
    # Create profile document
    profile_doc = {
        "user_id": current_user["_id"],
        "first_name": profile_data.first_name,
        "last_name": profile_data.last_name,
        "dob": datetime.combine(profile_data.dob, datetime.min.time()),  # Convert date to datetime
        "height_cm": float(profile_data.height_cm),
        "start_weight_kg": float(profile_data.start_weight_kg),
        "gender": profile_data.gender,
        "allergies": profile_data.allergies or [],
        "dietary_prefs": profile_data.dietary_prefs or [],
        "medical_notes": profile_data.medical_notes,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await patient_profiles_collection.insert_one(profile_doc)
    profile_doc["_id"] = result.inserted_id
    
    return {
        "id": str(profile_doc["_id"]),
        "user_id": str(profile_doc["user_id"]),
        "first_name": profile_doc["first_name"],
        "last_name": profile_doc["last_name"],
        "dob": profile_doc["dob"].date() if isinstance(profile_doc["dob"], datetime) else profile_doc["dob"],
        "height_cm": profile_doc["height_cm"],
        "start_weight_kg": profile_doc["start_weight_kg"],
        "gender": profile_doc["gender"],
        "allergies": profile_doc["allergies"],
        "dietary_prefs": profile_doc["dietary_prefs"],
        "medical_notes": profile_doc.get("medical_notes")
    }

@router.put("/profile", response_model=PatientProfileResponse)
async def update_patient_profile(
    profile_data: PatientProfileUpdate,
    current_user = Depends(get_current_patient)
):
    """Update patient profile."""
    patient_profiles_collection = get_collection("patient_profiles")
    
    # Check if profile exists
    existing_profile = await patient_profiles_collection.find_one({"user_id": current_user["_id"]})
    if not existing_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Create a profile first using POST /profile"
        )
    
    # Update existing profile
    update_data = profile_data.dict(exclude_unset=True)
    
    # Validate dietary preferences if provided
    if "dietary_prefs" in update_data and update_data["dietary_prefs"]:
        valid_prefs = [pref.value for pref in DietaryPreference]
        for pref in update_data["dietary_prefs"]:
            if pref not in valid_prefs:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid dietary preference: {pref}. Valid options: {valid_prefs}"
                )
    
    # Ensure numeric fields are properly converted
    if "height_cm" in update_data and update_data["height_cm"] is not None:
        update_data["height_cm"] = float(update_data["height_cm"])
    if "start_weight_kg" in update_data and update_data["start_weight_kg"] is not None:
        update_data["start_weight_kg"] = float(update_data["start_weight_kg"])
    
    # Convert date to datetime if provided
    if "dob" in update_data and update_data["dob"] is not None:
        update_data["dob"] = datetime.combine(update_data["dob"], datetime.min.time())
        
    update_data["updated_at"] = datetime.utcnow()
    
    await patient_profiles_collection.update_one(
        {"user_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    # Get updated profile
    updated_profile = await patient_profiles_collection.find_one({"user_id": current_user["_id"]})
    return {
        "id": str(updated_profile["_id"]),
        "user_id": str(updated_profile["user_id"]),
        "first_name": updated_profile["first_name"],
        "last_name": updated_profile["last_name"],
        "dob": updated_profile["dob"].date() if isinstance(updated_profile["dob"], datetime) else updated_profile["dob"],
        "height_cm": updated_profile["height_cm"],
        "start_weight_kg": updated_profile["start_weight_kg"],
        "gender": updated_profile["gender"],
        "allergies": updated_profile["allergies"],
        "dietary_prefs": updated_profile["dietary_prefs"],
        "medical_notes": updated_profile.get("medical_notes")
    }

@router.get("/profile", response_model=PatientProfileResponse)
async def get_patient_profile(current_user = Depends(get_current_patient)):
    """Get patient profile."""
    patient_profiles_collection = get_collection("patient_profiles")
    
    profile = await patient_profiles_collection.find_one({"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return {
        "id": str(profile["_id"]),
        "user_id": str(profile["user_id"]),
        "first_name": profile["first_name"],
        "last_name": profile["last_name"],
        "dob": profile["dob"].date() if isinstance(profile["dob"], datetime) else profile["dob"],
        "height_cm": profile["height_cm"],
        "start_weight_kg": profile["start_weight_kg"],
        "gender": profile["gender"],
        "allergies": profile["allergies"],
        "dietary_prefs": profile["dietary_prefs"],
        "medical_notes": profile.get("medical_notes")
    }

@router.get("/current-plan", response_model=MealPlanResponse)
async def get_current_meal_plan(current_user = Depends(get_current_patient)):
    """Get current meal plan for the patient."""
    meal_plans_collection = get_collection("meal_plans")
    
    # Find the most recent published meal plan
    current_plan = await meal_plans_collection.find_one(
        {
            "patient_id": current_user["_id"],
            "status": "published"
        },
        sort=[("week_start", -1)]
    )
    
    if not current_plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No current meal plan found"
        )
    
    return {
        "id": str(current_plan["_id"]),
        "patient_id": str(current_plan["patient_id"]),
        "nutritionist_id": str(current_plan["nutritionist_id"]),
        "week_start": current_plan["week_start"].date() if isinstance(current_plan["week_start"], datetime) else current_plan["week_start"],
        "notes": current_plan.get("notes"),
        "status": current_plan["status"],
        "days": current_plan["days"],
        "created_at": current_plan["created_at"].isoformat(),
        "updated_at": current_plan["updated_at"].isoformat()
    }

@router.post("/progress", response_model=ProgressReportResponse)
async def create_progress_report(
    progress_data: ProgressReportCreate,
    current_user = Depends(get_current_patient)
):
    """Create a new progress report."""
    progress_collection = get_collection("progress_reports")
    
    # Check if report already exists for this week
    existing_report = await progress_collection.find_one({
        "patient_id": current_user["_id"],
        "week_start": datetime.combine(progress_data.week_start, datetime.min.time())  # Convert date to datetime for query
    })
    
    if existing_report:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Progress report already exists for this week"
        )
    
    # Create progress report
    progress_doc = {
        "patient_id": current_user["_id"],
        "week_start": datetime.combine(progress_data.week_start, datetime.min.time()),  # Convert date to datetime
        "weight_kg": progress_data.weight_kg,
        "waist_cm": progress_data.waist_cm,
        "photos": progress_data.photos,
        "adherence_pct": progress_data.adherence_pct,
        "energy_levels": progress_data.energy_levels,
        "notes": progress_data.notes,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await progress_collection.insert_one(progress_doc)
    progress_doc["_id"] = result.inserted_id
    
    return {
        "id": str(progress_doc["_id"]),
        "patient_id": str(progress_doc["patient_id"]),
        "week_start": progress_doc["week_start"].date() if isinstance(progress_doc["week_start"], datetime) else progress_doc["week_start"],
        "weight_kg": progress_doc["weight_kg"],
        "waist_cm": progress_doc["waist_cm"],
        "photos": progress_doc["photos"],
        "adherence_pct": progress_doc["adherence_pct"],
        "energy_levels": progress_doc["energy_levels"],
        "notes": progress_doc["notes"]
    }

@router.get("/progress", response_model=List[ProgressReportResponse])
async def get_progress_reports(
    current_user = Depends(get_current_patient),
    limit: int = 10,
    skip: int = 0
):
    """Get patient's progress reports."""
    progress_collection = get_collection("progress_reports")
    
    cursor = progress_collection.find(
        {"patient_id": current_user["_id"]},
        sort=[("week_start", -1)]
    ).skip(skip).limit(limit)
    
    reports = []
    async for report in cursor:
        reports.append({
            "id": str(report["_id"]),
            "patient_id": str(report["patient_id"]),
            "week_start": report["week_start"].date() if isinstance(report["week_start"], datetime) else report["week_start"],
            "weight_kg": report["weight_kg"],
            "waist_cm": report["waist_cm"],
            "photos": report["photos"],
            "adherence_pct": report["adherence_pct"],
            "energy_levels": report["energy_levels"],
            "notes": report["notes"]
        })
    
    return reports 