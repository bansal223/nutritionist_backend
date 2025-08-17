from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AssignmentCreate(BaseModel):
    patient_id: str
    nutritionist_id: str
    start_date: datetime
    end_date: Optional[datetime] = None
    notes: Optional[str] = None

class AssignmentUpdate(BaseModel):
    end_date: Optional[datetime] = None
    active: Optional[bool] = None
    notes: Optional[str] = None

class AssignmentResponse(BaseModel):
    id: str
    patient_id: str
    nutritionist_id: str
    start_date: datetime
    end_date: Optional[datetime] = None
    active: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime 