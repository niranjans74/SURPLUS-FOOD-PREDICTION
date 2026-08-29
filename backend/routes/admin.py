from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from backend.database import get_db
from backend import models, schemas
from backend.auth.utils import get_current_active_admin

router = APIRouter(prefix="/admin", tags=["Admin Operations"])

class StatusUpdatePayload(BaseModel):
    status: str # "approved", "rejected", "pending"

@router.get("/donors", response_model=List[schemas.DonorProfileResponse])
def get_all_donors(
    current_admin: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    donors = db.query(models.Donor).order_by(models.Donor.created_at.desc()).all()
    return donors

@router.put("/donors/{donor_id}/status", response_model=schemas.DonorProfileResponse)
def update_donor_status(
    donor_id: int,
    payload: StatusUpdatePayload,
    current_admin: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    donor = db.query(models.Donor).filter(models.Donor.id == donor_id).first()
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")
    
    if payload.status not in ["approved", "rejected", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid approval status")
    
    donor.approval_status = payload.status
    db.commit()
    db.refresh(donor)
    return donor

@router.get("/ngos", response_model=List[schemas.NgoProfileResponse])
def get_all_ngos(
    current_admin: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    ngos = db.query(models.NGO).order_by(models.NGO.created_at.desc()).all()
    return ngos

@router.put("/ngos/{ngo_id}/status", response_model=schemas.NgoProfileResponse)
def update_ngo_status(
    ngo_id: int,
    payload: StatusUpdatePayload,
    current_admin: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    ngo = db.query(models.NGO).filter(models.NGO.id == ngo_id).first()
    if not ngo:
        raise HTTPException(status_code=404, detail="NGO not found")
    
    if payload.status not in ["approved", "rejected", "pending"]:
        raise HTTPException(status_code=400, detail="Invalid approval status")
    
    ngo.approval_status = payload.status
    db.commit()
    db.refresh(ngo)
    return ngo

@router.get("/donations", response_model=List[schemas.DonationResponse])
def get_all_donations(
    current_admin: models.User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    donations = db.query(models.Donation).order_by(models.Donation.created_at.desc()).all()
    return donations
