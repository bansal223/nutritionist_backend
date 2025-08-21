from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_nutritionist
from app.core.database import get_collection
from app.models.profile import NutritionistProfileResponse, NutritionistProfileUpdate
from app.models.progress import ProgressReportResponse
from app.models.meal_plan import MealPlanResponse
from bson import ObjectId
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pydantic import BaseModel

# Response models for new APIs
class DashboardStats(BaseModel):
    total_patients: int
    active_patients: int
    total_meal_plans: int
    average_rating: float
    completion_rate: float
    new_patients_this_month: int
    pending_tasks: int

class PatientSummary(BaseModel):
    patient_id: str
    patient_name: str
    total_reports: int
    avg_weight_loss: float
    avg_adherence: float
    last_report_date: str
    status: str

class RecentActivity(BaseModel):
    id: str
    type: str
    title: str
    description: str
    time: str
    patient_name: str

class NutritionistStats(BaseModel):
    dashboard_stats: DashboardStats
    patient_summaries: List[PatientSummary]
    recent_activities: List[RecentActivity]

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

@router.put("/profile", response_model=NutritionistProfileResponse)
async def update_nutritionist_profile(
    profile_data: NutritionistProfileUpdate,
    current_user = Depends(get_current_nutritionist)
):
    """Update nutritionist profile."""
    nutritionist_profiles_collection = get_collection("nutritionist_profiles")
    
    # Check if profile exists
    profile = await nutritionist_profiles_collection.find_one({"user_id": current_user["_id"]})
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Create a profile first."
        )
    
    # Update profile
    update_data = profile_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await nutritionist_profiles_collection.update_one(
        {"user_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    # Get updated profile
    updated_profile = await nutritionist_profiles_collection.find_one({"user_id": current_user["_id"]})
    
    return {
        "id": str(updated_profile["_id"]),
        "user_id": str(updated_profile["user_id"]),
        "registration_no": updated_profile["registration_no"],
        "qualifications": updated_profile["qualifications"],
        "years_experience": updated_profile["years_experience"],
        "bio": updated_profile["bio"],
        "rate_week_inr": updated_profile["rate_week_inr"],
        "verified": updated_profile["verified"]
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
        
        if patient_user:
            # Use profile data if available, otherwise use basic user info
            patient_name = "Profile Not Created"
            current_weight = None
            
            if patient_profile:
                patient_name = f"{patient_profile['first_name']} {patient_profile['last_name']}"
                current_weight = patient_profile["start_weight_kg"]
            
            patients.append({
                "assignment_id": str(assignment["_id"]),
                "patient_id": str(assignment["patient_id"]),
                "patient_name": patient_name,
                "patient_email": patient_user["email"],
                "start_date": assignment["start_date"],
                "current_weight": current_weight,
                "status": patient_user["status"],
                "has_profile": patient_profile is not None
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
            "week_start": report["week_start"].date() if isinstance(report["week_start"], datetime) else report["week_start"],
            "weight_kg": report["weight_kg"],
            "waist_cm": report["waist_cm"],
            "photos": report["photos"],
            "adherence_pct": report["adherence_pct"],
            "energy_levels": report["energy_levels"],
            "notes": report["notes"]
        })
    
    return reports

@router.get("/dashboard/stats", response_model=NutritionistStats)
async def get_nutritionist_dashboard_stats(current_user = Depends(get_current_nutritionist)):
    """Get comprehensive dashboard statistics for nutritionist."""
    assignments_collection = get_collection("assignments")
    patient_profiles_collection = get_collection("patient_profiles")
    users_collection = get_collection("users")
    meal_plans_collection = get_collection("meal_plans")
    progress_collection = get_collection("progress_reports")
    
    # Get all assignments for this nutritionist
    assignments_cursor = assignments_collection.find({"nutritionist_id": current_user["_id"], "active": True})
    assignments = await assignments_cursor.to_list(length=None)
    
    total_patients = len(assignments)
    active_patients = total_patients  # All assignments are active
    
    # Calculate new patients this month
    current_month_start = datetime.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_patients_this_month = len([
        assignment for assignment in assignments 
        if assignment.get("start_date", datetime.now()) >= current_month_start
    ])
    
    # Get meal plans count
    meal_plans_cursor = meal_plans_collection.find({"nutritionist_id": current_user["_id"]})
    total_meal_plans = await meal_plans_cursor.count_documents({})
    
    # Calculate average rating and completion rate (mock data for now)
    average_rating = 4.8
    completion_rate = 92.0
    pending_tasks = 3
    
    # Create patient summaries
    patient_summaries = []
    for assignment in assignments:
        patient_id = assignment["patient_id"]
        
        # Get patient profile
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
                # Calculate average weight loss (simplified)
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
            
            patient_summaries.append(PatientSummary(
                patient_id=str(patient_id),
                patient_name=patient_name,
                total_reports=total_reports,
                avg_weight_loss=round(avg_weight_loss, 1),
                avg_adherence=round(avg_adherence, 0),
                last_report_date=last_report_date,
                status=status
            ))
    
    # Create recent activities (mock data for now)
    recent_activities = [
        RecentActivity(
            id="1",
            type="meal_plan",
            title="New meal plan created",
            description="Weekly plan for Sarah Johnson",
            time="2 hours ago",
            patient_name="Sarah Johnson"
        ),
        RecentActivity(
            id="2",
            type="progress",
            title="Progress report updated",
            description="Weight loss milestone achieved",
            time="4 hours ago",
            patient_name="Mike Chen"
        ),
        RecentActivity(
            id="3",
            type="patient",
            title="New patient assigned",
            description="Welcome to Emma Davis",
            time="1 day ago",
            patient_name="Emma Davis"
        ),
        RecentActivity(
            id="4",
            type="message",
            title="Patient message received",
            description="Question about meal plan",
            time="2 days ago",
            patient_name="John Smith"
        )
    ]
    
    dashboard_stats = DashboardStats(
        total_patients=total_patients,
        active_patients=active_patients,
        total_meal_plans=total_meal_plans,
        average_rating=average_rating,
        completion_rate=completion_rate,
        new_patients_this_month=new_patients_this_month,
        pending_tasks=pending_tasks
    )
    
    return NutritionistStats(
        dashboard_stats=dashboard_stats,
        patient_summaries=patient_summaries,
        recent_activities=recent_activities
    )

@router.get("/meal-plans", response_model=List[MealPlanResponse])
async def get_nutritionist_meal_plans(
    current_user = Depends(get_current_nutritionist),
    limit: int = 20,
    skip: int = 0,
    patient_id: str = None
):
    """Get meal plans created by the nutritionist."""
    meal_plans_collection = get_collection("meal_plans")
    
    # Build query
    query = {"nutritionist_id": current_user["_id"]}
    if patient_id:
        query["patient_id"] = ObjectId(patient_id)
    
    cursor = meal_plans_collection.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    
    meal_plans = []
    async for meal_plan in cursor:
        meal_plans.append({
            "id": str(meal_plan["_id"]),
            "patient_id": str(meal_plan["patient_id"]),
            "nutritionist_id": str(meal_plan["nutritionist_id"]),
            "week_start": meal_plan["week_start"].date() if isinstance(meal_plan["week_start"], datetime) else meal_plan["week_start"],
            "notes": meal_plan.get("notes", ""),
            "status": meal_plan.get("status", "draft"),
            "days": meal_plan.get("days", []),
            "created_at": meal_plan.get("created_at", datetime.now()),
            "updated_at": meal_plan.get("updated_at", datetime.now())
        })
    
    return meal_plans

@router.get("/progress/summary", response_model=List[PatientSummary])
async def get_patient_progress_summary(current_user = Depends(get_current_nutritionist)):
    """Get progress summary for all patients."""
    assignments_collection = get_collection("assignments")
    patient_profiles_collection = get_collection("patient_profiles")
    users_collection = get_collection("users")
    progress_collection = get_collection("progress_reports")
    
    # Get all assignments for this nutritionist
    assignments_cursor = assignments_collection.find({"nutritionist_id": current_user["_id"], "active": True})
    assignments = await assignments_cursor.to_list(length=None)
    
    patient_summaries = []
    for assignment in assignments:
        patient_id = assignment["patient_id"]
        
        # Get patient profile
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
                # Calculate average weight loss (simplified)
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
            
            patient_summaries.append(PatientSummary(
                patient_id=str(patient_id),
                patient_name=patient_name,
                total_reports=total_reports,
                avg_weight_loss=round(avg_weight_loss, 1),
                avg_adherence=round(avg_adherence, 0),
                last_report_date=last_report_date,
                status=status
            ))
    
    return patient_summaries

@router.get("/analytics/overview", response_model=Dict[str, Any])
async def get_nutritionist_analytics(current_user = Depends(get_current_nutritionist)):
    """Get comprehensive analytics for nutritionist."""
    assignments_collection = get_collection("assignments")
    meal_plans_collection = get_collection("meal_plans")
    progress_collection = get_collection("progress_reports")
    
    # Get basic stats
    total_patients = await assignments_collection.count_documents({"nutritionist_id": current_user["_id"], "active": True})
    total_meal_plans = await meal_plans_collection.count_documents({"nutritionist_id": current_user["_id"]})
    
    # Get progress reports for all patients
    assignments_cursor = assignments_collection.find({"nutritionist_id": current_user["_id"], "active": True})
    assignments = await assignments_cursor.to_list(length=None)
    
    total_reports = 0
    total_adherence = 0
    total_weight_loss = 0
    
    for assignment in assignments:
        patient_id = assignment["patient_id"]
        progress_cursor = progress_collection.find({"patient_id": patient_id})
        progress_reports = await progress_cursor.to_list(length=None)
        
        total_reports += len(progress_reports)
        for report in progress_reports:
            total_adherence += report.get("adherence_pct", 0)
            total_weight_loss += report.get("weight_kg", 0)
    
    avg_adherence = total_adherence / total_reports if total_reports > 0 else 0
    avg_weight_loss = total_weight_loss / total_reports if total_reports > 0 else 0
    
    # Calculate monthly trends
    current_month = datetime.now().month
    current_year = datetime.now().year
    
    monthly_stats = []
    for i in range(6):  # Last 6 months
        month = current_month - i
        year = current_year
        if month <= 0:
            month += 12
            year -= 1
        
        month_start = datetime(year, month, 1)
        month_end = (month_start + timedelta(days=32)).replace(day=1) - timedelta(days=1)
        
        # Count meal plans created in this month
        meal_plans_count = await meal_plans_collection.count_documents({
            "nutritionist_id": current_user["_id"],
            "created_at": {"$gte": month_start, "$lte": month_end}
        })
        
        monthly_stats.append({
            "month": month_start.strftime("%B %Y"),
            "meal_plans": meal_plans_count,
            "patients": total_patients  # Simplified for now
        })
    
    return {
        "overview": {
            "total_patients": total_patients,
            "total_meal_plans": total_meal_plans,
            "total_reports": total_reports,
            "avg_adherence": round(avg_adherence, 1),
            "avg_weight_loss": round(avg_weight_loss, 1),
            "completion_rate": 92.0,  # Mock data
            "rating": 4.8  # Mock data
        },
        "monthly_trends": monthly_stats,
        "performance_metrics": {
            "patient_satisfaction": 4.8,
            "goal_achievement_rate": 85.0,
            "response_time_hours": 2.5,
            "profile_completion_rate": 78.0
        }
    } 