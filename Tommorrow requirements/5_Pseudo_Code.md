# Pseudo Code

The following pseudo-code represents the major algorithms implemented in the **ResqFood Link Platform**. These algorithms support surplus food prediction and NGO selection by providing fallback prediction logic and compatibility scoring.

---

## 1. Machine Learning Surplus Prediction – Fallback Heuristic

This algorithm estimates the amount of surplus food when the trained Machine Learning model is unavailable or its required artifacts are missing.

```text
FUNCTION calculate_surplus_prediction(prepared_qty, expected_attendees, actual_attendees, food_category):

    // Step 1: Calculate the attendee ratio
    attendee_ratio = actual_attendees / expected_attendees

    // Step 2: Estimate the surplus fraction
    IF attendee_ratio < 1.0 THEN
        surplus_fraction = (1.0 - attendee_ratio) * 0.85
    ELSE
        // Apply a baseline waste factor when attendance meets or exceeds expectations
        surplus_fraction = 0.05
    ENDIF

    // Step 3: Apply food category-specific multipliers
    IF food_category IS "Cooked Meals" OR food_category IS "Buffet" THEN
        surplus_fraction = surplus_fraction * 1.15

    ELSE IF food_category IS "Bakery" OR food_category IS "Bread" THEN
        surplus_fraction = surplus_fraction * 0.90
    ENDIF

    // Step 4: Calculate predicted surplus weight
    predicted_weight = prepared_qty * surplus_fraction

    // Step 5: Ensure the prediction remains within valid boundaries
    predicted_weight = max(0.0, min(predicted_weight, prepared_qty))

    // Step 6: Round the result to two decimal places
    RETURN round(predicted_weight, 2)

END FUNCTION
```

### Working Principle

The algorithm first calculates the ratio between actual and expected attendees. When actual attendance is lower than expected, the difference is used to estimate the potential surplus. Food-category multipliers are then applied to account for different wastage characteristics. Finally, the predicted quantity is restricted between **0 kg and the total prepared quantity**.

---

## 2. NGO Compatibility Scoring Algorithm

This algorithm evaluates the suitability of an NGO for a specific food donation request. The final score is calculated using **distance, quantity-capacity fit, and food-category compatibility**.

```text
FUNCTION calculate_ngo_score(donation_request, ngo_profile):

    score = 0.0

    // Step 1: Calculate geographical distance
    dist_km = calculate_haversine_distance(
        donation_request.latitude,
        donation_request.longitude,
        ngo_profile.latitude,
        ngo_profile.longitude
    )

    // Step 2: Distance scoring – 25% Weight
    IF dist_km <= 5.0 THEN
        score += 25.0

    ELSE IF dist_km <= 15.0 THEN
        score += 15.0

    ELSE
        score += 5.0
    ENDIF

    // Step 3: Quantity vs. capacity scoring – 35% Weight
    capacity_diff = ngo_profile.daily_capacity - donation_request.quantity_kg

    IF capacity_diff >= 0.0 THEN
        score += 35.0

    ELSE IF capacity_diff > -20.0 THEN
        score += 20.0

    ELSE
        score += 5.0
    ENDIF

    // Step 4: Food-category matching – 40% Weight
    IF donation_request.food_category IN ngo_profile.accepted_categories THEN
        score += 40.0

    ELSE
        score += 10.0
    ENDIF

    // Step 5: Return final compatibility score
    RETURN score

END FUNCTION
```

### Working Principle

The NGO scoring algorithm assigns points based on three major factors:

* **Distance – 25%:** NGOs located closer to the donor receive higher scores.
* **Quantity and Capacity Fit – 35%:** NGOs capable of handling the donated quantity receive higher scores.
* **Food Category Matching – 40%:** NGOs that accept the specific food category receive the highest score.

The scores from all three criteria are added together to produce the **final NGO compatibility score**. NGOs can then be ranked from highest to lowest score, allowing the donor to identify the most suitable organization for the donation.
