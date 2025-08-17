from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date
from enum import Enum

class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"

class MealPlanStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class Meal(BaseModel):
    meal_type: MealType
    title: str = Field(..., min_length=1, max_length=100)
    calories: int = Field(..., ge=0)
    protein_g: float = Field(..., ge=0)
    carbs_g: float = Field(..., ge=0)
    fat_g: float = Field(..., ge=0)
    notes: Optional[str] = None

class DayPlan(BaseModel):
    day_of_week: int = Field(..., ge=0, le=6)  # 0=Monday, 6=Sunday
    meals: List[Meal]

class MealPlanBase(BaseModel):
    patient_id: str
    nutritionist_id: str
    week_start: date
    notes: Optional[str] = None
    status: MealPlanStatus = MealPlanStatus.DRAFT
    days: List[DayPlan]

class MealPlanCreate(MealPlanBase):
    pass

class MealPlanUpdate(BaseModel):
    notes: Optional[str] = None
    status: Optional[MealPlanStatus] = None
    days: Optional[List[DayPlan]] = None

class MealPlanResponse(MealPlanBase):
    id: str
    created_at: str
    updated_at: str

class MealPlanSummary(BaseModel):
    id: str
    patient_id: str
    nutritionist_id: str
    week_start: date
    status: MealPlanStatus
    total_calories: int
    total_protein: float
    total_carbs: float
    total_fat: float 