from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend import models, schemas
from backend.auth.utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    # 1. Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
        
    # 2. Check role validation
    if user_data.role not in ["donor", "ngo", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be 'donor', 'ngo', or 'admin'"
        )

    # 2.5 Password strength validation
    password = user_data.password
    if len(password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )
    if not any(c.isupper() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter."
        )
    if not any(not c.isalnum() for c in password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character."
        )

    # 3. Create the user
    new_user = models.User(
        email=user_data.email,
        password_hash=hash_password(user_data.password),
        role=user_data.role,
        name=user_data.name,
        phone=user_data.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 4. Create the corresponding profile (admin has no profile record)
    try:
        if user_data.role == "admin":
            db.refresh(new_user)
            return new_user
        
        if user_data.role == "donor":
            if not user_data.company_name or not user_data.donor_type:
                db.delete(new_user)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="company_name and donor_type are required for donor role"
                )
            
            donor_profile = models.Donor(
                user_id=new_user.id,
                company_name=user_data.company_name,
                donor_type=user_data.donor_type,
                address=user_data.address,
                latitude=user_data.latitude,
                longitude=user_data.longitude,
                approval_status="pending"
            )
            db.add(donor_profile)
            db.commit()
            
        elif user_data.role == "ngo":
            if not user_data.organization_name:
                db.delete(new_user)
                db.commit()
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="organization_name is required for ngo role"
                )
            
            ngo_profile = models.NGO(
                user_id=new_user.id,
                organization_name=user_data.organization_name,
                registration_number=user_data.registration_number,
                address=user_data.address,
                latitude=user_data.latitude,
                longitude=user_data.longitude,
                approval_status="pending"
            )
            db.add(ngo_profile)
            db.commit()
            
        db.refresh(new_user)
        return new_user
    except Exception as e:
        db.rollback()
        # Clean up user if profile creation failed
        db.query(models.User).filter(models.User.id == new_user.id).delete()
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile registration failed: {str(e)}"
        )


@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    # 1. Fetch user
    user = db.query(models.User).filter(models.User.email == login_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, password, or role"
        )
        
    # 2. Check role matches
    if user.role != login_data.role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, password, or role"
        )

    # 3. Verify password
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email, password, or role"
        )

    # 4. Generate JWT token
    token_payload = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role
    }
    access_token = create_access_token(data=token_payload)
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user
