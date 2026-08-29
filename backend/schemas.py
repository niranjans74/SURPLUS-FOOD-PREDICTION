from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

# Role enum choices
class UserRole(str):
    donor = "donor"
    ngo = "ngo"
    admin = "admin"

class DonorType(str):
    restaurant = "restaurant"
    supermarket = "supermarket"
    hotel = "hotel"
    caterer = "caterer"
    other = "other"

class ApprovalStatus(str):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

# Base User Schema
class UserBase(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None

# User Registration Schema
class UserRegister(UserBase):
    password: str = Field(..., min_length=6)
    role: str  # "donor" or "ngo"
    
    # Donor specific fields (optional, used if role == "donor")
    company_name: Optional[str] = None
    donor_type: Optional[str] = None  # restaurant, supermarket, hotel, caterer, other
    
    # NGO specific fields (optional, used if role == "ngo")
    organization_name: Optional[str] = None
    registration_number: Optional[str] = None
    
    # Shared Profile fields
    address: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

# User Login Schema
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: str  # "donor", "ngo", or "admin"

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: int
    email: str
    role: str

# Profile Responses
class DonorProfileResponse(BaseModel):
    id: int
    company_name: str
    donor_type: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    approval_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class NgoProfileResponse(BaseModel):
    id: int
    organization_name: str
    registration_number: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    approval_status: str
    created_at: datetime

    class Config:
        from_attributes = True

# User Response Schema
class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    donor_profile: Optional[DonorProfileResponse] = None
    ngo_profile: Optional[NgoProfileResponse] = None

    class Config:
        from_attributes = True

# Prediction Schemas for Module 1
class PredictionRequest(BaseModel):
    food_category: str
    meal_type: str
    day_of_week: int
    event_type: str
    prepared_quantity: float
    expected_people: int
    actual_people: int
    previous_surplus: float
    preparation_time: float

class PredictionResponse(BaseModel):
    predicted_surplus: float
    surplus_level: str
    estimated_meals: int
    recommended_action: str
    prediction_id: int

class PredictionHistoryResponse(BaseModel):
    id: int
    predicted_quantity: float
    predicted_at: datetime
    features: dict

    class Config:
        from_attributes = True


class NGORequirementCreate(BaseModel):
    food_types: List[str]
    quantity_needed: float
    capacity: float
    urgency_level: str


class NGORequirementResponse(BaseModel):
    id: int
    ngo_id: int
    food_type_needed: str
    quantity_needed: float
    capacity: Optional[float] = None
    urgency_level: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DonationCreate(BaseModel):
    ngo_id: int
    prediction_id: int
    food_item: str
    quantity: float
    unit: Optional[str] = "kg"
    expiry_time: datetime


class DonationResponse(BaseModel):
    id: int
    donor_id: int
    ngo_id: Optional[int] = None
    prediction_id: Optional[int] = None
    food_item: str
    quantity: float
    unit: str
    expiry_time: datetime
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ComponentScoreDetail(BaseModel):
    score: float
    weighted: float
    detail: str


class RecommendationBreakdown(BaseModel):
    food_type: ComponentScoreDetail
    distance: ComponentScoreDetail
    quantity_fit: ComponentScoreDetail
    capacity: ComponentScoreDetail
    urgency: ComponentScoreDetail


class NGORecommendationResponse(BaseModel):
    ngo_id: int
    organization_name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_km: float
    match_score: float
    quantity_needed: float
    capacity: Optional[float] = None
    urgency_level: str
    food_type_needed: str
    breakdown: RecommendationBreakdown


class DonationStatusUpdate(BaseModel):
    status: str
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    remarks: Optional[str] = None


class TrackingLogCreate(BaseModel):
    status: str
    remarks: str


class TrackingLogResponse(BaseModel):
    id: int
    donation_id: int
    ngo_id: Optional[int] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    status: str
    updated_by: Optional[str] = None
    remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DashboardAnalytics(BaseModel):
    total_donated_weight: float
    completed_deliveries: int
    meals_served: int
    co2_saved: float
    waste_reduction_efficiency: float
    monthly_trends: List[dict]
    category_distribution: List[dict]
    status_distribution: List[dict]
    contributions: List[dict]


