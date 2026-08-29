from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend import models, schemas
from backend.auth.utils import get_current_active_donor, get_current_user

router = APIRouter(prefix="/donations", tags=["Donation Operations"])

def validate_transition(current_status: str, new_status: str) -> bool:
    allowed = {
        "REQUEST CREATED": ["NGO ACCEPTED", "cancelled"],
        "NGO ACCEPTED": ["PICKUP ASSIGNED", "cancelled"],
        "PICKUP ASSIGNED": ["FOOD COLLECTED", "cancelled"],
        "FOOD COLLECTED": ["DELIVERED", "DISTRIBUTION COMPLETED", "cancelled"],
        "DELIVERED": ["DISTRIBUTION COMPLETED", "cancelled"],
        "DISTRIBUTION COMPLETED": [],
        "cancelled": [],
        # Fallbacks for legacy/seed values
        "available": ["claimed", "NGO ACCEPTED", "cancelled", "REQUEST CREATED"],
        "claimed": ["picked_up", "PICKUP ASSIGNED", "FOOD COLLECTED", "cancelled"],
        "picked_up": ["delivered", "DELIVERED", "DISTRIBUTION COMPLETED", "cancelled"],
        "delivered": ["DISTRIBUTION COMPLETED"]
    }
    if current_status not in allowed:
        return True
    return new_status in allowed[current_status]

@router.post("", response_model=schemas.DonationResponse, status_code=status.HTTP_201_CREATED)
def create_donation_request(
    req: schemas.DonationCreate,
    current_user: models.User = Depends(get_current_active_donor),
    db: Session = Depends(get_db)
):
    donor_profile = current_user.donor_profile
    if not donor_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active donor profile is required to initiate donation requests."
        )

    # Verify target NGO exists
    ngo = db.query(models.NGO).filter(models.NGO.id == req.ngo_id).first()
    if not ngo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target NGO not found."
        )

    # Verify prediction exists
    prediction = db.query(models.Prediction).filter(models.Prediction.id == req.prediction_id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prediction record not found."
        )

    try:
        new_donation = models.Donation(
            donor_id=donor_profile.id,
            ngo_id=req.ngo_id,
            prediction_id=req.prediction_id,
            food_item=req.food_item,
            quantity=req.quantity,
            unit=req.unit or "kg",
            expiry_time=req.expiry_time,
            status="REQUEST CREATED"
        )
        db.add(new_donation)
        db.commit()
        db.refresh(new_donation)

        # Log initial transition
        initial_log = models.DeliveryTracking(
            donation_id=new_donation.id,
            ngo_id=new_donation.ngo_id,
            status="REQUEST CREATED",
            updated_by=current_user.email,
            remarks=f"Donation dispatched to {ngo.organization_name} based on ML surplus match."
        )
        db.add(initial_log)
        db.commit()

        return new_donation
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record donation request: {str(e)}"
        )

@router.get("/my-donations", response_model=List[schemas.DonationResponse])
def get_my_donations(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "donor" or not current_user.donor_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only donors can view their donations log."
        )
    
    donations = db.query(models.Donation).filter(
        models.Donation.donor_id == current_user.donor_profile.id
    ).order_by(models.Donation.created_at.desc()).all()
    return donations

@router.get("/my-claims", response_model=List[schemas.DonationResponse])
def get_my_claims(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "ngo" or not current_user.ngo_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only NGOs can view their claims directory."
        )
    
    donations = db.query(models.Donation).filter(
        models.Donation.ngo_id == current_user.ngo_profile.id
    ).order_by(models.Donation.created_at.desc()).all()
    return donations

@router.get("/{donation_id}", response_model=schemas.DonationResponse)
def get_donation_by_id(
    donation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation not found"
        )
    return donation

@router.put("/{donation_id}/status", response_model=schemas.DonationResponse)
def update_donation_status(
    donation_id: int,
    req: schemas.DonationStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation record not found."
        )

    # State transition validation
    if not validate_transition(donation.status, req.status):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Illegal transition: Cannot advance status from '{donation.status}' to '{req.status}'."
        )

    try:
        donation.status = req.status
        db.commit()

        actor_name = current_user.name or current_user.email
        # Default meaningful remarks if not provided
        default_remarks = {
            "NGO ACCEPTED": f"Donation request accepted by {actor_name}.",
            "PICKUP ASSIGNED": f"Pickup vehicle and driver assigned: {req.driver_name or 'Transit Partner'}.",
            "FOOD COLLECTED": f"Food packages collected from donor facility.",
            "DELIVERED": f"Food arrived safely at NGO community hub.",
            "DISTRIBUTION COMPLETED": f"Food inspected and distributed to local beneficiaries."
        }
        remarks = req.remarks or default_remarks.get(req.status, f"Status updated to '{req.status}' by {current_user.role}.")

        # Log transition in delivery tracking table
        log_entry = models.DeliveryTracking(
            donation_id=donation.id,
            ngo_id=donation.ngo_id,
            status=req.status,
            updated_by=f"{current_user.name} ({current_user.role.upper()})",
            remarks=remarks,
            driver_name=req.driver_name,
            driver_phone=req.driver_phone
        )
        db.add(log_entry)
        db.commit()
        db.refresh(donation)
        return donation

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update status and log transition: {str(e)}"
        )

@router.get("/{donation_id}/tracking", response_model=List[schemas.TrackingLogResponse])
def get_donation_tracking(
    donation_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    donation = db.query(models.Donation).filter(models.Donation.id == donation_id).first()
    if not donation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Donation record not found."
        )

    logs = db.query(models.DeliveryTracking).filter(
        models.DeliveryTracking.donation_id == donation_id
    ).order_by(models.DeliveryTracking.created_at.asc()).all()
    
    return logs
