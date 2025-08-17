from fastapi import APIRouter, Depends, HTTPException, status
from app.api.deps import get_current_admin, get_current_nutritionist
from app.core.database import get_collection
from app.models.assignment import AssignmentCreate, AssignmentUpdate, AssignmentResponse
from app.models.user import UserRole
from bson import ObjectId
from datetime import datetime
from typing import List

router = APIRouter()

@router.post("/", response_model=AssignmentResponse)
async def create_assignment(
    assignment_data: AssignmentCreate,
    current_user = Depends(get_current_admin)
):
    """Create a new patient-nutritionist assignment (Admin only)."""
    assignments_collection = get_collection("assignments")
    users_collection = get_collection("users")
    
    # Verify patient exists and is a patient
    patient = await users_collection.find_one({
        "_id": ObjectId(assignment_data.patient_id),
        "role": UserRole.PATIENT
    })
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify nutritionist exists and is a nutritionist
    nutritionist = await users_collection.find_one({
        "_id": ObjectId(assignment_data.nutritionist_id),
        "role": UserRole.NUTRITIONIST
    })
    if not nutritionist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nutritionist not found"
        )
    
    # Check if assignment already exists
    existing_assignment = await assignments_collection.find_one({
        "patient_id": ObjectId(assignment_data.patient_id),
        "nutritionist_id": ObjectId(assignment_data.nutritionist_id),
        "active": True
    })
    if existing_assignment:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment already exists"
        )
    
    # Create assignment
    assignment_doc = {
        "patient_id": ObjectId(assignment_data.patient_id),
        "nutritionist_id": ObjectId(assignment_data.nutritionist_id),
        "start_date": assignment_data.start_date,
        "end_date": assignment_data.end_date,
        "active": True,
        "notes": assignment_data.notes,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await assignments_collection.insert_one(assignment_doc)
    assignment_doc["_id"] = result.inserted_id
    
    return {
        "id": str(assignment_doc["_id"]),
        "patient_id": str(assignment_doc["patient_id"]),
        "nutritionist_id": str(assignment_doc["nutritionist_id"]),
        "start_date": assignment_doc["start_date"],
        "end_date": assignment_doc["end_date"],
        "active": assignment_doc["active"],
        "notes": assignment_doc["notes"],
        "created_at": assignment_doc["created_at"],
        "updated_at": assignment_doc["updated_at"]
    }

@router.get("/", response_model=List[AssignmentResponse])
async def get_assignments(
    current_user = Depends(get_current_admin),
    patient_id: str = None,
    nutritionist_id: str = None,
    active: bool = None,
    limit: int = 20,
    skip: int = 0
):
    """Get assignments (Admin only)."""
    assignments_collection = get_collection("assignments")
    
    # Build query
    query = {}
    if patient_id:
        query["patient_id"] = ObjectId(patient_id)
    if nutritionist_id:
        query["nutritionist_id"] = ObjectId(nutritionist_id)
    if active is not None:
        query["active"] = active
    
    cursor = assignments_collection.find(query, sort=[("created_at", -1)]).skip(skip).limit(limit)
    
    assignments = []
    async for assignment in cursor:
        assignments.append({
            "id": str(assignment["_id"]),
            "patient_id": str(assignment["patient_id"]),
            "nutritionist_id": str(assignment["nutritionist_id"]),
            "start_date": assignment["start_date"],
            "end_date": assignment["end_date"],
            "active": assignment["active"],
            "notes": assignment["notes"],
            "created_at": assignment["created_at"],
            "updated_at": assignment["updated_at"]
        })
    
    return assignments

@router.put("/{assignment_id}", response_model=AssignmentResponse)
async def update_assignment(
    assignment_id: str,
    assignment_data: AssignmentUpdate,
    current_user = Depends(get_current_admin)
):
    """Update an assignment (Admin only)."""
    assignments_collection = get_collection("assignments")
    
    # Find assignment
    assignment = await assignments_collection.find_one({"_id": ObjectId(assignment_id)})
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Update assignment
    update_data = assignment_data.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await assignments_collection.update_one(
        {"_id": ObjectId(assignment_id)},
        {"$set": update_data}
    )
    
    # Get updated assignment
    updated_assignment = await assignments_collection.find_one({"_id": ObjectId(assignment_id)})
    
    return {
        "id": str(updated_assignment["_id"]),
        "patient_id": str(updated_assignment["patient_id"]),
        "nutritionist_id": str(updated_assignment["nutritionist_id"]),
        "start_date": updated_assignment["start_date"],
        "end_date": updated_assignment["end_date"],
        "active": updated_assignment["active"],
        "notes": updated_assignment["notes"],
        "created_at": updated_assignment["created_at"],
        "updated_at": updated_assignment["updated_at"]
    }

@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    current_user = Depends(get_current_admin)
):
    """Delete an assignment (Admin only)."""
    assignments_collection = get_collection("assignments")
    
    result = await assignments_collection.delete_one({"_id": ObjectId(assignment_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    return {"message": "Assignment deleted successfully"} 