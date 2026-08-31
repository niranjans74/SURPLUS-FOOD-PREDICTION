# Pseudo Code

Below is the pseudo-code for the major algorithms in the ResqFood Link Platform.

---

## 1. Machine Learning Surplus Prediction Fallback Heuristic
This algorithm calculates the predicted food surplus when ML models are not fully trained or are missing.

```text
FUNCTION calculate_surplus_prediction(prepared_qty, expected_attendees, actual_attendees, food_category):
    // 1. Calculate the attendee ratio
    attendee_ratio = actual_attendees / expected_attendees
    
    // 2. Base logic: If attendance is less than expected, calculate proportional surplus
    IF attendee_ratio < 1.0 THEN
        surplus_fraction = (1.0 - attendee_ratio) * 0.85
    ELSE
        // Baseline waste factor (preparation padding)
        surplus_fraction = 0.05
    ENDIF

    // 3. Apply food category multipliers
    IF food_category IS "Cooked Meals" OR "Buffet" THEN
        surplus_fraction = surplus_fraction * 1.15
    ELSE IF food_category IS "Bakery" OR "Bread" THEN
        surplus_fraction = surplus_fraction * 0.90
    ENDIF

    // 4. Calculate weight and clamp to prepared quantity boundaries
    predicted_weight = prepared_qty * surplus_fraction
    predicted_weight = max(0.0, min(predicted_weight, prepared_qty))

    RETURN round(predicted_weight, 2)
```

---

## 2. NGO Compatibility Scoring Algorithm
This algorithm determines the suitability of a regional NGO for a specific donation request.

```text
FUNCTION calculate_ngo_score(donation_request, ngo_profile):
    score = 0.0
    
    // Weight 1: Distance (25% Weight)
    dist_km = calculate_haversine_distance(
        donation_request.latitude, donation_request.longitude,
        ngo_profile.latitude, ngo_profile.longitude
    )
    IF dist_km <= 5.0 THEN
        score += 25.0
    ELSE IF dist_km <= 15.0 THEN
        score += 15.0
    ELSE
        score += 5.0
    ENDIF

    // Weight 2: Quantity vs Capacity Fit (35% Weight)
    capacity_diff = ngo_profile.daily_capacity - donation_request.quantity_kg
    IF capacity_diff >= 0.0 THEN
        score += 35.0
    ELSE IF capacity_diff > -20.0 THEN
        score += 20.0
    ELSE
        score += 5.0
    ENDIF

    // Weight 3: Focus Matching (40% Weight)
    IF donation_request.food_category IN ngo_profile.accepted_categories THEN
        score += 40.0
    ELSE
        score += 10.0
    ENDIF

    RETURN score
```
