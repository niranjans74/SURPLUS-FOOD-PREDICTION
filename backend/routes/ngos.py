import math
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend import models, schemas
from backend.auth.utils import get_current_user

router = APIRouter(prefix="/ngos", tags=["NGO Operations"])

def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371.0  # Earth's radius in kilometers
    return c * r

@router.post("/requirements", response_model=schemas.NGORequirementResponse, status_code=status.HTTP_200_OK)
def set_ngo_requirements(
    req: schemas.NGORequirementCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "ngo":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only authenticated NGO accounts can update requirements."
        )

    ngo_profile = current_user.ngo_profile
    if not ngo_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active NGO profile is required to update requirements."
        )

    # Check for existing active requirement
    active_req = db.query(models.NGORequirement).filter(
        models.NGORequirement.ngo_id == ngo_profile.id,
        models.NGORequirement.status == "active"
    ).first()

    # Comma-separate the list of food types
    food_types_str = ",".join(req.food_types)

    if active_req:
        active_req.food_type_needed = food_types_str
        active_req.quantity_needed = req.quantity_needed
        active_req.capacity = req.capacity
        active_req.urgency_level = req.urgency_level
        db.commit()
        db.refresh(active_req)
        return active_req
    else:
        new_req = models.NGORequirement(
            ngo_id=ngo_profile.id,
            food_type_needed=food_types_str,
            quantity_needed=req.quantity_needed,
            capacity=req.capacity,
            urgency_level=req.urgency_level,
            status="active"
        )
        db.add(new_req)
        db.commit()
        db.refresh(new_req)
        return new_req

@router.get("/nearby", response_model=List[schemas.NGORecommendationResponse])
def get_nearby_ngos(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Return all approved NGOs
    ngos = db.query(models.NGO).filter(models.NGO.approval_status == "approved").all()
    
    # Check if current user has coordinates to calculate distance
    donor_lat = None
    donor_lng = None
    if current_user.role == "donor" and current_user.donor_profile:
        donor_lat = current_user.donor_profile.latitude
        donor_lng = current_user.donor_profile.longitude

    results = []
    for ngo in ngos:
        active_req = db.query(models.NGORequirement).filter(
            models.NGORequirement.ngo_id == ngo.id,
            models.NGORequirement.status == "active"
        ).first()

        distance = 0.0
        if donor_lat is not None and donor_lng is not None and ngo.latitude is not None and ngo.longitude is not None:
            distance = haversine(float(donor_lat), float(donor_lng), float(ngo.latitude), float(ngo.longitude))

        food_type_needed = active_req.food_type_needed if active_req else "None"
        qty = float(active_req.quantity_needed) if active_req else 0.0
        cap = float(active_req.capacity) if active_req and active_req.capacity is not None else 100.0
        urg = active_req.urgency_level if active_req else "low"

        # Safe breakdown default
        breakdown = {
            "food_type": {"score": 0.0, "weighted": 0.0, "detail": "N/A"},
            "distance": {"score": 0.0, "weighted": 0.0, "detail": "N/A"},
            "quantity_fit": {"score": 0.0, "weighted": 0.0, "detail": "N/A"},
            "capacity": {"score": 0.0, "weighted": 0.0, "detail": "N/A"},
            "urgency": {"score": 0.0, "weighted": 0.0, "detail": "N/A"}
        }

        results.append({
            "ngo_id": ngo.id,
            "organization_name": ngo.organization_name,
            "address": ngo.address,
            "latitude": float(ngo.latitude) if ngo.latitude else None,
            "longitude": float(ngo.longitude) if ngo.longitude else None,
            "distance_km": round(distance, 2),
            "match_score": 0.0,
            "quantity_needed": qty,
            "capacity": cap,
            "urgency_level": urg,
            "food_type_needed": food_type_needed,
            "breakdown": breakdown
        })
    return results

@router.get("/recommendations", response_model=List[schemas.NGORecommendationResponse])
def get_recommendations(
    prediction_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. Fetch prediction details
    prediction = db.query(models.Prediction).filter(models.Prediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found"
        )

    # 2. Get donor profile (origin of donation)
    donor = prediction.donor
    if not donor or donor.latitude is None or donor.longitude is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Donor profile coordinate information is missing."
        )

    donor_lat = float(donor.latitude)
    donor_lon = float(donor.longitude)
    pred_qty = float(prediction.predicted_quantity)
    pred_food_cat = prediction.features.get("food_category", "other") if prediction.features else "other"

    # 3. Query all approved NGOs
    ngos = db.query(models.NGO).filter(models.NGO.approval_status == "approved").all()
    recommendations = []

    for ngo in ngos:
        if ngo.latitude is None or ngo.longitude is None:
            continue

        ngo_lat = float(ngo.latitude)
        ngo_lon = float(ngo.longitude)

        # Retrieve active requirement
        active_req = db.query(models.NGORequirement).filter(
            models.NGORequirement.ngo_id == ngo.id,
            models.NGORequirement.status == "active"
        ).first()

        # Compute details
        req_food_types = [t.strip() for t in active_req.food_type_needed.split(",")] if active_req else []
        qty_needed = float(active_req.quantity_needed) if active_req else 50.0 # default need
        ngo_capacity = float(active_req.capacity) if active_req and active_req.capacity is not None else 100.0
        urgency = active_req.urgency_level if active_req else "low"

        # Calculate Distance
        dist_km = haversine(donor_lat, donor_lon, ngo_lat, ngo_lon)

        # ---------------------------------------------
        # Score 1: Food Type Compatibility (30% weight)
        # ---------------------------------------------
        if pred_food_cat in req_food_types:
            food_score = 100.0
            food_detail = f"Match! Selected food type '{pred_food_cat}' is accepted by NGO."
        else:
            food_score = 0.0
            food_detail = f"Mismatch: NGO does not accept '{pred_food_cat}' (needs: {', '.join(req_food_types) or 'None'})."
        
        # ---------------------------------------------
        # Score 2: Distance Score (25% weight)
        # ---------------------------------------------
        # 100 points for <=2km, decaying to 0 points at >=15km
        if dist_km <= 2.0:
            dist_score = 100.0
        else:
            dist_score = max(0.0, 1.0 - ((dist_km - 2.0) / 13.0)) * 100.0
        dist_detail = f"Distance is {dist_km:.2f} km from donor."

        # ---------------------------------------------
        # Score 3: Quantity Fit (20% weight)
        # ---------------------------------------------
        # Ratio of overlap: min(pred, req) / max(pred, req)
        if pred_qty > 0 and qty_needed > 0:
            qty_fit_score = (min(pred_qty, qty_needed) / max(pred_qty, qty_needed)) * 100.0
        else:
            qty_fit_score = 0.0
        qty_fit_detail = f"NGO requirement is {qty_needed:.1f} kg. Prediction is {pred_qty:.1f} kg."

        # ---------------------------------------------
        # Score 4: NGO Capacity (15% weight)
        # ---------------------------------------------
        # Check if quantity exceeds capacity
        if pred_qty <= ngo_capacity:
            cap_score = 100.0
        else:
            cap_score = (ngo_capacity / pred_qty) * 100.0
        cap_detail = f"NGO capacity limit is {ngo_capacity:.1f} kg. Prediction is {pred_qty:.1f} kg."

        # ---------------------------------------------
        # Score 5: Urgency (10% weight)
        # ---------------------------------------------
        if urgency == "high":
            urg_score = 100.0
        elif urgency == "medium":
            urg_score = 60.0
        else:
            urg_score = 20.0
        urg_detail = f"NGO urgency indicator is '{urgency}'."

        # Calculate weighted sum
        total_score = (
            (food_score * 0.30) +
            (dist_score * 0.25) +
            (qty_fit_score * 0.20) +
            (cap_score * 0.15) +
            (urg_score * 0.10)
        )

        breakdown = {
            "food_type": {"score": round(food_score, 1), "weighted": round(food_score * 0.30, 2), "detail": food_detail},
            "distance": {"score": round(dist_score, 1), "weighted": round(dist_score * 0.25, 2), "detail": dist_detail},
            "quantity_fit": {"score": round(qty_fit_score, 1), "weighted": round(qty_fit_score * 0.20, 2), "detail": qty_fit_detail},
            "capacity": {"score": round(cap_score, 1), "weighted": round(cap_score * 0.15, 2), "detail": cap_detail},
            "urgency": {"score": round(urg_score, 1), "weighted": round(urg_score * 0.10, 2), "detail": urg_detail}
        }

        recommendations.append({
            "ngo_id": ngo.id,
            "organization_name": ngo.organization_name,
            "address": ngo.address,
            "latitude": ngo_lat,
            "longitude": ngo_lon,
            "distance_km": round(dist_km, 2),
            "match_score": round(total_score, 1),
            "quantity_needed": qty_needed,
            "capacity": ngo_capacity,
            "urgency_level": urgency,
            "food_type_needed": active_req.food_type_needed if active_req else "None",
            "breakdown": breakdown
        })

    # Sort recommendations by match_score in descending order
    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations
