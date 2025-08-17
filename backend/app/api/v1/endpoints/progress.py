from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_user
from app.core.database import get_collection
from app.models.progress import ProgressReportResponse, ProgressSummary
from bson import ObjectId
from typing import List

router = APIRouter()

@router.get("/", response_model=List[ProgressReportResponse])
async def get_progress_reports(
    current_user = Depends(get_current_active_user),
    patient_id: str = None,
    limit: int = 10,
    skip: int = 0
):
    """Get progress reports."""
    progress_collection = get_collection("progress_reports")
    
    # Build query based on user role
    if current_user["role"] == "patient":
        query = {"patient_id": current_user["_id"]}
    elif current_user["role"] == "nutritionist" and patient_id:
        # Verify assignment for nutritionist
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
        query = {"patient_id": ObjectId(patient_id)}
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    cursor = progress_collection.find(
        query,
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

@router.get("/summary/{patient_id}", response_model=ProgressSummary)
async def get_progress_summary(
    patient_id: str,
    current_user = Depends(get_current_active_user)
):
    """Get progress summary for a patient."""
    # Verify access
    if current_user["role"] == "patient":
        if str(current_user["_id"]) != patient_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
    elif current_user["role"] == "nutritionist":
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
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get patient profile for start weight
    patient_profiles_collection = get_collection("patient_profiles")
    patient_profile = await patient_profiles_collection.find_one({"user_id": ObjectId(patient_id)})
    
    if not patient_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient profile not found"
        )
    
    # Get progress reports
    progress_collection = get_collection("progress_reports")
    cursor = progress_collection.find(
        {"patient_id": ObjectId(patient_id)},
        sort=[("week_start", -1)]
    )
    
    reports = []
    async for report in cursor:
        reports.append(report)
    
    if not reports:
        return {
            "patient_id": patient_id,
            "start_weight": patient_profile["start_weight_kg"],
            "current_weight": patient_profile["start_weight_kg"],
            "total_weight_lost": 0,
            "total_weeks": 0,
            "average_weekly_loss": 0,
            "last_report_date": None
        }
    
    # Calculate summary
    start_weight = patient_profile["start_weight_kg"]
    current_weight = reports[0]["weight_kg"]
    total_weight_lost = start_weight - current_weight
    total_weeks = len(reports)
    average_weekly_loss = total_weight_lost / total_weeks if total_weeks > 0 else 0
    last_report_date = reports[0]["week_start"]
    
    return {
        "patient_id": patient_id,
        "start_weight": start_weight,
        "current_weight": current_weight,
        "total_weight_lost": total_weight_lost,
        "total_weeks": total_weeks,
        "average_weekly_loss": average_weekly_loss,
        "last_report_date": last_report_date
    } 