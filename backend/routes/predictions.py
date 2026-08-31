import os
import joblib
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend import models, schemas
from backend.auth.utils import get_current_active_donor, get_current_user

router = APIRouter(prefix="/predictions", tags=["Surplus Prediction"])

# Lazy-load the ML model to prevent startup crashes if model is training
model_path = "backend/ml/best_model.joblib"
_model = None

def get_ml_model():
    global _model
    if _model is None:
        if not os.path.exists(model_path):
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="ML prediction model is not trained or loaded. Run model training pipeline first."
            )
        try:
            _model = joblib.load(model_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to load ML model artifact: {str(e)}"
            )
    return _model

@router.post("", response_model=schemas.PredictionResponse, status_code=status.HTTP_201_CREATED)
def predict_surplus(
    req: schemas.PredictionRequest,
    current_user: models.User = Depends(get_current_active_donor),
    db: Session = Depends(get_db)
):
    # Retrieve donor profile
    donor_profile = current_user.donor_profile
    if not donor_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Active donor profile is required to generate surplus forecasts."
        )

    # 1. Build input dataframe matching columns used during training
    input_data = {
        'donor_type': [donor_profile.donor_type],
        'food_category': [req.food_category],
        'meal_type': [req.meal_type],
        'day_of_week': [req.day_of_week],
        'event_type': [req.event_type],
        'prepared_quantity': [req.prepared_quantity],
        'expected_people': [req.expected_people],
        'actual_people': [req.actual_people],
        'previous_surplus': [req.previous_surplus],
        'preparation_time': [req.preparation_time]
    }
    
    df = pd.DataFrame(input_data)

    # 3. Predict surplus quantity using trained pipeline (preprocessor + regressor)
    fallback_used = False
    try:
        model = get_ml_model()
        df = pd.DataFrame(input_data)
        raw_prediction = model.predict(df)[0]
        predicted_surplus = max(0.0, min(float(raw_prediction), req.prepared_quantity))
        predicted_surplus = round(predicted_surplus, 2)
    except Exception as e:
        print(f"Prediction pipeline/model failed (using fallback heuristic): {e}")
        fallback_used = True
        # Heuristic calculation based on attendance ratio and preparation parameters
        attendance_ratio = (req.actual_people / req.expected_people) if req.expected_people > 0 else 1.0
        unused_ratio = max(0.0, 1.0 - attendance_ratio)
        
        # Base surplus on the ratio of attendees not eating
        predicted_surplus = req.prepared_quantity * unused_ratio
        
        # Adjust slightly based on previous surplus if available
        if req.previous_surplus > 0:
            predicted_surplus = (predicted_surplus + req.previous_surplus) / 2.0
            
        predicted_surplus = max(0.0, min(float(predicted_surplus), req.prepared_quantity))
        predicted_surplus = round(predicted_surplus, 2)

    # 4. Calculate meals & categorical level
    # Labeled metric: 0.4kg represents standard portion per meal
    estimated_meals = int(predicted_surplus / 0.4)
    
    ratio = predicted_surplus / req.prepared_quantity if req.prepared_quantity > 0 else 0
    if ratio < 0.10:
        surplus_level = "Low"
        recommended_action = "Low: Store in pantry or distribute to walk-in community members."
    elif ratio < 0.25:
        surplus_level = "Medium"
        recommended_action = "Medium: List listing for claim by matching community NGOs immediately."
    else:
        surplus_level = "High"
        recommended_action = "High: Flag listing for high-priority claim and coordinate urgent driver routing."

    if fallback_used:
        recommended_action = f"[Heuristic Forecast Engine Active] {recommended_action}"

    # 5. Save prediction in database predictions table
    try:
        new_prediction = models.Prediction(
            donor_id=donor_profile.id,
            predicted_quantity=predicted_surplus,
            features={
                'food_category': req.food_category,
                'meal_type': req.meal_type,
                'day_of_week': req.day_of_week,
                'event_type': req.event_type,
                'prepared_quantity': req.prepared_quantity,
                'expected_people': req.expected_people,
                'actual_people': req.actual_people,
                'previous_surplus': req.previous_surplus,
                'preparation_time': req.preparation_time,
                'donor_type': donor_profile.donor_type
            }
        )
        db.add(new_prediction)
        db.commit()
        db.refresh(new_prediction)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record prediction in database: {str(e)}"
        )

    return {
        "predicted_surplus": predicted_surplus,
        "surplus_level": surplus_level,
        "estimated_meals": estimated_meals,
        "recommended_action": recommended_action,
        "prediction_id": new_prediction.id
    }

@router.get("/{donor_id}", response_model=List[schemas.PredictionHistoryResponse])
def get_prediction_history(
    donor_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Security check: Donors can only view their own history. Admins can view any history.
    if current_user.role == 'donor':
        if not current_user.donor_profile or current_user.donor_profile.id != donor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to view this donor's prediction history."
            )
            
    history = db.query(models.Prediction).filter(
        models.Prediction.donor_id == donor_id
    ).order_by(models.Prediction.predicted_at.desc()).all()
    
    return history
