from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_nutritionist
from app.core.database import get_collection
from app.models.profile import NutritionistProfileResponse
from app.models.progress import ProgressReportResponse
from bson import ObjectId
from typing import List

router = APIRouter()

@router.get("/profile", response_model=NutritionistProfileResponse)
async def get_nutritionist_profile(current_user = Depends(get_current_nutritionist)):
    """Get nutritionist profile."""
    nutritionist_profiles_collection = get_collection("nutritionist_profiles")
    
    profile = await nutritionist_profiles_collection.find_one({"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return {
        "id": str(profile["_id"]),
        "user_id": str(profile["user_id"]),
        "registration_no": profile["registration_no"],
        "qualifications": profile["qualifications"],
        "years_experience": profile["years_experience"],
        "bio": profile["bio"],
        "rate_week_inr": profile["rate_week_inr"],
        "verified": profile["verified"]
    }

@router.get("/patients", response_model=List[dict])
async def get_nutritionist_patients(
    current_user = Depends(get_current_nutritionist),
    limit: int = 20,
    skip: int = 0
):
    """Get list of patients assigned to the nutritionist."""
    assignments_collection = get_collection("assignments")
    patient_profiles_collection = get_collection("patient_profiles")
    users_collection = get_collection("users")
    
    # Get assignments for this nutritionist
    cursor = assignments_collection.find(
        {"nutritionist_id": current_user["_id"], "active": True}
    ).skip(skip).limit(limit)
    
    patients = []
    async for assignment in cursor:
        # Get patient profile
        patient_profile = await patient_profiles_collection.find_one(
            {"user_id": assignment["patient_id"]}
        )
        
        # Get user info
        patient_user = await users_collection.find_one({"_id": assignment["patient_id"]})
        
        if patient_profile and patient_user:
            patients.append({
                "assignment_id": str(assignment["_id"]),
                "patient_id": str(assignment["patient_id"]),
                "patient_name": f"{patient_profile['first_name']} {patient_profile['last_name']}",
                "patient_email": patient_user["email"],
                "start_date": assignment["start_date"],
                "current_weight": patient_profile["start_weight_kg"],  # This should be updated from progress
                "status": patient_user["status"]
            })
    
    return patients

@router.get("/patients/{patient_id}/progress", response_model=List[ProgressReportResponse])
async def get_patient_progress(
    patient_id: str,
    current_user = Depends(get_current_nutritionist),
    limit: int = 10,
    skip: int = 0
):
    """Get progress reports for a specific patient."""
    # Verify assignment
    assignments_collection = get_collection("assignments")
    assignment = await assignments_collection.find_one({
        "nutritionist_id": current_user["_id"],
        "patient_id": ObjectId(patient_id),
        "active": True
    })
    
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not assigned to this nutritionist"
        )
    
    # Get progress reports
    progress_collection = get_collection("progress_reports")
    cursor = progress_collection.find(
        {"patient_id": ObjectId(patient_id)},
        sort=[("week_start", -1)]
    ).skip(skip).limit(limit)
    
    reports = []
    async for report in cursor:
        reports.append({
            "id": str(report["_id"]),
            "patient_id": str(report["patient_id"]),
            "week_start": report["week_start"],
            "weight_kg": report["weight_kg"],
            "waist_cm": report["waist_cm"],
            "photos": report["photos"],
            "adherence_pct": report["adherence_pct"],
            "energy_levels": report["energy_levels"],
            "notes": report["notes"]
        })
    
    return reports 