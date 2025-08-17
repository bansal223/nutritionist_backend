from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from enum import Enum

class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"

class DietaryPreference(str, Enum):
    VEG = "veg"
    NON_VEG = "non_veg"
    VEGAN = "vegan"
    KETO = "keto"
    PALEO = "paleo"

class PatientProfileBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=50)
    last_name: str = Field(..., min_length=1, max_length=50)
    dob: date
    height_cm: float = Field(..., gt=0, le=300)
    start_weight_kg: float = Field(..., gt=0, le=500)
    gender: Gender
    allergies: List[str] = []
    dietary_prefs: List[DietaryPreference] = []
    medical_notes: Optional[str] = None

class PatientProfileCreate(PatientProfileBase):
    user_id: str

class PatientProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=50)
    last_name: Optional[str] = Field(None, min_length=1, max_length=50)
    dob: Optional[date] = None
    height_cm: Optional[float] = Field(None, gt=0, le=300)
    start_weight_kg: Optional[float] = Field(None, gt=0, le=500)
    gender: Optional[Gender] = None
    allergies: Optional[List[str]] = None
    dietary_prefs: Optional[List[DietaryPreference]] = None
    medical_notes: Optional[str] = None

class PatientProfileResponse(PatientProfileBase):
    id: str
    user_id: str

class NutritionistProfileBase(BaseModel):
    registration_no: str = Field(..., min_length=1, max_length=50)
    qualifications: str = Field(..., min_length=1)
    years_experience: int = Field(..., ge=0, le=50)
    bio: str = Field(..., min_length=10, max_length=1000)
    rate_week_inr: float = Field(..., gt=0)
    verified: bool = False

class NutritionistProfileCreate(NutritionistProfileBase):
    user_id: str

class NutritionistProfileUpdate(BaseModel):
    registration_no: Optional[str] = Field(None, min_length=1, max_length=50)
    qualifications: Optional[str] = Field(None, min_length=1)
    years_experience: Optional[int] = Field(None, ge=0, le=50)
    bio: Optional[str] = Field(None, min_length=10, max_length=1000)
    rate_week_inr: Optional[float] = Field(None, gt=0)
    verified: Optional[bool] = None

class NutritionistProfileResponse(NutritionistProfileBase):
    id: str
    user_id: str 