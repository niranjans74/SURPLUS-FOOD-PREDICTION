from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime
from backend.database import get_db
from backend import models, schemas
from backend.auth.utils import get_current_user

router = APIRouter(prefix="/analytics", tags=["Platform Analytics"])

@router.get("", response_model=schemas.DashboardAnalytics)
def get_platform_analytics(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Retrieve all donations to perform database-driven aggregations
    donations = db.query(models.Donation).all()
    predictions = db.query(models.Prediction).all()

    # Filters for completed deliveries
    # Enforced status: DELIVERED, DISTRIBUTION COMPLETED
    completed_statuses = ["DELIVERED", "DISTRIBUTION COMPLETED"]
    completed_donations = [d for d in donations if d.status in completed_statuses]

    # 1. Totals
    total_donated_weight = sum(float(d.quantity) for d in completed_donations)
    completed_deliveries = len(completed_donations)
    meals_served = int(total_donated_weight / 0.4) # 0.4kg per meal
    co2_saved = round(total_donated_weight * 2.5, 1) # 2.5kg CO2 offset per kg rescued

    # Efficiency: (Rescued weight / predicted surplus weight) * 100
    total_predicted_weight = sum(float(p.predicted_quantity) for p in predictions)
    if total_predicted_weight > 0:
        efficiency = min(100.0, round((total_donated_weight / total_predicted_weight) * 100.0, 1))
    else:
        efficiency = 0.0

    # 2. Monthly Trends (group by month-year)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_data = {m: 0.0 for m in months}
    
    for d in completed_donations:
        month_idx = d.created_at.month - 1
        if 0 <= month_idx < 12:
            m_name = months[month_idx]
            monthly_data[m_name] += float(d.quantity)

    monthly_trends = [{"name": m, "amount": round(val, 1)} for m, val in monthly_data.items()]

    # 3. Category Distribution (group by prediction feature food category)
    categories = {
        "cooked_meals": "Cooked Meals",
        "bakery": "Bakery Items",
        "dairy": "Dairy Products",
        "fresh_produce": "Fresh Produce",
        "meat_poultry": "Meat & Poultry",
        "other": "Other Products"
    }
    category_weights = {k: 0.0 for k in categories.keys()}
    
    for d in completed_donations:
        cat = "other"
        if d.prediction and d.prediction.features:
            cat = d.prediction.features.get("food_category", "other")
        elif "vegetable" in d.food_item.lower() or "produce" in d.food_item.lower():
            cat = "fresh_produce"
        elif "cooked" in d.food_item.lower() or "buffet" in d.food_item.lower() or "rice" in d.food_item.lower():
            cat = "cooked_meals"
        elif "bread" in d.food_item.lower() or "bakery" in d.food_item.lower():
            cat = "bakery"
            
        if cat in category_weights:
            category_weights[cat] += float(d.quantity)
        else:
            category_weights["other"] += float(d.quantity)

    category_distribution = [
        {"name": categories[k], "value": round(v, 1)}
        for k, v in category_weights.items() if v > 0
    ]
    # Fallback to keep charts from rendering blank if no completed donations exist
    if not category_distribution:
        category_distribution = [{"name": "No Completed Rescues Yet", "value": 1.0}]

    # 4. Status Distribution
    status_counts = {}
    for d in donations:
        status_counts[d.status] = status_counts.get(d.status, 0) + 1
    
    status_distribution = [
        {"name": k, "value": v} for k, v in status_counts.items()
    ]
    if not status_distribution:
        status_distribution = [{"name": "No Listings Registered", "value": 1}]

    # 5. Contributions (Donor and NGO breakdowns)
    donor_weights = {}
    ngo_weights = {}
    
    for d in completed_donations:
        d_name = d.donor.company_name if d.donor else f"Donor #{d.donor_id}"
        n_name = d.ngo.organization_name if d.ngo else f"NGO #{d.ngo_id}"
        
        donor_weights[d_name] = donor_weights.get(d_name, 0.0) + float(d.quantity)
        ngo_weights[n_name] = ngo_weights.get(n_name, 0.0) + float(d.quantity)

    contributions = []
    for d_name, val in donor_weights.items():
        contributions.append({"name": d_name, "value": round(val, 1), "type": "Donor"})
    for n_name, val in ngo_weights.items():
        contributions.append({"name": n_name, "value": round(val, 1), "type": "NGO"})

    # Ensure list is not empty
    if not contributions:
        contributions = [{"name": "No Contributions Recorded", "value": 0.1, "type": "System"}]

    return {
        "total_donated_weight": round(total_donated_weight, 1),
        "completed_deliveries": completed_deliveries,
        "meals_served": meals_served,
        "co2_saved": co2_saved,
        "waste_reduction_efficiency": efficiency,
        "monthly_trends": monthly_trends,
        "category_distribution": category_distribution,
        "status_distribution": status_distribution,
        "contributions": contributions
    }
