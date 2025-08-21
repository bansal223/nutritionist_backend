from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_active_user, get_current_nutritionist
from app.core.database import get_collection
from app.models.progress import ProgressReportResponse, ProgressSummary
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pydantic import BaseModel

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

# Enhanced progress endpoints for nutritionists
class ProgressAnalytics(BaseModel):
    total_reports: int
    avg_weight_loss: float
    avg_adherence: float
    improvement_rate: float
    recent_trend: str

class PatientProgressOverview(BaseModel):
    patient_id: str
    patient_name: str
    total_reports: int
    avg_weight_loss: float
    avg_adherence: float
    last_report_date: str
    status: str
    analytics: ProgressAnalytics

@router.get("/nutritionist/overview", response_model=List[PatientProgressOverview])
async def get_nutritionist_progress_overview(
    current_user = Depends(get_current_nutritionist),
    limit: int = 20,
    skip: int = 0
):
    """Get progress overview for all patients assigned to nutritionist."""
    assignments_collection = get_collection("assignments")
    patient_profiles_collection = get_collection("patient_profiles")
    users_collection = get_collection("users")
    progress_collection = get_collection("progress_reports")
    
    # Get all assignments for this nutritionist
    assignments_cursor = assignments_collection.find({"nutritionist_id": current_user["_id"], "active": True})
    assignments = await assignments_cursor.to_list(length=None)
    
    patient_overviews = []
    for assignment in assignments:
        patient_id = assignment["patient_id"]
        
        # Get patient profile and user info
        patient_profile = await patient_profiles_collection.find_one({"user_id": patient_id})
        patient_user = await users_collection.find_one({"_id": patient_id})
        
        if patient_user:
            patient_name = "Profile Not Created"
            if patient_profile:
                patient_name = f"{patient_profile['first_name']} {patient_profile['last_name']}"
            
            # Get progress reports for this patient
            progress_cursor = progress_collection.find({"patient_id": patient_id})
            progress_reports = await progress_cursor.to_list(length=None)
            
            total_reports = len(progress_reports)
            avg_weight_loss = 0.0
            avg_adherence = 0.0
            last_report_date = datetime.now().isoformat()
            
            if progress_reports:
                # Calculate averages
                avg_weight_loss = sum(report.get("weight_kg", 0) for report in progress_reports) / len(progress_reports)
                avg_adherence = sum(report.get("adherence_pct", 0) for report in progress_reports) / len(progress_reports)
                last_report_date = max(report.get("created_at", datetime.now()) for report in progress_reports).isoformat()
            
            # Determine status based on adherence
            if avg_adherence >= 80:
                status = "improving"
            elif avg_adherence >= 60:
                status = "stable"
            else:
                status = "declining"
            
            # Calculate analytics
            improvement_rate = 0.0
            recent_trend = "stable"
            
            if len(progress_reports) >= 2:
                # Calculate improvement rate based on recent reports
                recent_reports = sorted(progress_reports, key=lambda x: x.get("created_at", datetime.now()))[-2:]
                if len(recent_reports) == 2:
                    weight_diff = recent_reports[1].get("weight_kg", 0) - recent_reports[0].get("weight_kg", 0)
                    improvement_rate = (weight_diff / recent_reports[0].get("weight_kg", 1)) * 100 if recent_reports[0].get("weight_kg", 0) > 0 else 0
                    
                    if improvement_rate > 2:
                        recent_trend = "improving"
                    elif improvement_rate < -2:
                        recent_trend = "declining"
                    else:
                        recent_trend = "stable"
            
            analytics = ProgressAnalytics(
                total_reports=total_reports,
                avg_weight_loss=round(avg_weight_loss, 1),
                avg_adherence=round(avg_adherence, 0),
                improvement_rate=round(improvement_rate, 1),
                recent_trend=recent_trend
            )
            
            patient_overviews.append(PatientProgressOverview(
                patient_id=str(patient_id),
                patient_name=patient_name,
                total_reports=total_reports,
                avg_weight_loss=round(avg_weight_loss, 1),
                avg_adherence=round(avg_adherence, 0),
                last_report_date=last_report_date,
                status=status,
                analytics=analytics
            ))
    
    return patient_overviews

@router.get("/nutritionist/analytics", response_model=Dict[str, Any])
async def get_nutritionist_progress_analytics(
    current_user = Depends(get_current_nutritionist),
    time_period: str = "month"  # week, month, quarter, year
):
    """Get comprehensive progress analytics for nutritionist."""
    assignments_collection = get_collection("assignments")
    progress_collection = get_collection("progress_reports")
    
    # Get all assignments for this nutritionist
    assignments_cursor = assignments_collection.find({"nutritionist_id": current_user["_id"], "active": True})
    assignments = await assignments_cursor.to_list(length=None)
    
    # Calculate time period
    now = datetime.now()
    if time_period == "week":
        start_date = now - timedelta(days=7)
    elif time_period == "month":
        start_date = now - timedelta(days=30)
    elif time_period == "quarter":
        start_date = now - timedelta(days=90)
    elif time_period == "year":
        start_date = now - timedelta(days=365)
    else:
        start_date = now - timedelta(days=30)  # Default to month
    
    total_patients = len(assignments)
    total_reports = 0
    total_adherence = 0
    total_weight_loss = 0
    patient_progress = []
    
    for assignment in assignments:
        patient_id = assignment["patient_id"]
        
        # Get progress reports for this patient in the time period
        progress_cursor = progress_collection.find({
            "patient_id": patient_id,
            "created_at": {"$gte": start_date}
        })
        progress_reports = await progress_cursor.to_list(length=None)
        
        total_reports += len(progress_reports)
        
        if progress_reports:
            patient_adherence = sum(report.get("adherence_pct", 0) for report in progress_reports) / len(progress_reports)
            patient_weight_loss = sum(report.get("weight_kg", 0) for report in progress_reports) / len(progress_reports)
            
            total_adherence += patient_adherence
            total_weight_loss += patient_weight_loss
            
            patient_progress.append({
                "patient_id": str(patient_id),
                "reports_count": len(progress_reports),
                "avg_adherence": round(patient_adherence, 1),
                "avg_weight_loss": round(patient_weight_loss, 1)
            })
    
    avg_adherence = total_adherence / total_patients if total_patients > 0 else 0
    avg_weight_loss = total_weight_loss / total_patients if total_patients > 0 else 0
    
    # Calculate trends
    trends = {
        "adherence_trend": "stable",
        "weight_loss_trend": "stable",
        "patient_engagement": "high" if avg_adherence >= 80 else "medium" if avg_adherence >= 60 else "low"
    }
    
    return {
        "overview": {
            "total_patients": total_patients,
            "total_reports": total_reports,
            "avg_adherence": round(avg_adherence, 1),
            "avg_weight_loss": round(avg_weight_loss, 1),
            "time_period": time_period
        },
        "trends": trends,
        "patient_progress": patient_progress,
        "performance_metrics": {
            "completion_rate": round((total_reports / (total_patients * 4)) * 100, 1) if total_patients > 0 else 0,  # Assuming 4 reports per month
            "engagement_score": round(avg_adherence, 1),
            "success_rate": round((len([p for p in patient_progress if p["avg_adherence"] >= 80]) / total_patients) * 100, 1) if total_patients > 0 else 0
        }
    } 