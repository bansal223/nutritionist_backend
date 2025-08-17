from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from enum import Enum

class ProgressReportBase(BaseModel):
    patient_id: str
    week_start: date
    weight_kg: float = Field(..., gt=0, le=500)
    waist_cm: Optional[float] = Field(None, gt=0, le=200)
    photos: List[str] = []  # S3 URLs
    adherence_pct: int = Field(..., ge=0, le=100)
    energy_levels: int = Field(..., ge=1, le=10)
    notes: Optional[str] = None

class ProgressReportCreate(ProgressReportBase):
    pass

class ProgressReportUpdate(BaseModel):
    weight_kg: Optional[float] = Field(None, gt=0, le=500)
    waist_cm: Optional[float] = Field(None, gt=0, le=200)
    photos: Optional[List[str]] = None
    adherence_pct: Optional[int] = Field(None, ge=0, le=100)
    energy_levels: Optional[int] = Field(None, ge=1, le=10)
    notes: Optional[str] = None

class ProgressReportResponse(ProgressReportBase):
    id: str
    created_at: str
    updated_at: str

class ProgressSummary(BaseModel):
    patient_id: str
    start_weight: float
    current_weight: float
    total_weight_lost: float
    total_weeks: int
    average_weekly_loss: float
    last_report_date: Optional[date] = None 