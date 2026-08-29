import pandas as pd
import numpy as np
import os

def generate_dataset(num_samples=1500, filename="backend/ml/simulated_surplus_data.csv"):
    print(f"Generating {num_samples} simulated records...")
    
    np.random.seed(42)
    
    # 1. Generate Categorical Variables
    donor_types = ['restaurant', 'supermarket', 'hotel', 'caterer', 'other']
    food_categories = ['bakery', 'cooked_meals', 'dairy', 'fresh_produce', 'meat_poultry', 'other']
    meal_types = ['breakfast', 'lunch', 'dinner', 'snack', 'all_day']
    event_types = ['none', 'wedding', 'corporate', 'holiday', 'weekend_rush']
    
    data = []
    for _ in range(num_samples):
        d_type = np.random.choice(donor_types)
        f_cat = np.random.choice(food_categories)
        m_type = np.random.choice(meal_types)
        d_week = np.random.randint(0, 7) # 0 = Monday, 6 = Sunday
        e_type = np.random.choice(event_types, p=[0.6, 0.1, 0.1, 0.1, 0.1])
        
        # 2. Numerical Variables
        # Prepared quantity ranges from 20kg to 400kg
        prepared_qty = np.random.uniform(20.0, 400.0)
        
        # Expected people based on prepared quantity (roughly 0.4 to 0.8 kg per person)
        expected_ppl = int(prepared_qty / np.random.uniform(0.4, 0.8))
        if expected_ppl < 10:
            expected_ppl = 10
            
        # Shortfall (expected - actual). Strong relationship with event_type.
        # Shortfall ratio defaults to centered around 15%, but with high variance
        shortfall_ratio = np.random.normal(0.15, 0.12)
        if e_type == 'none':
            shortfall_ratio += np.random.uniform(-0.05, 0.05)
        elif e_type == 'corporate':
            # Corporate events sometimes have higher dropouts (up to 30%)
            shortfall_ratio += np.random.uniform(0.05, 0.20)
        elif e_type == 'wedding':
            # Weddings have low dropouts (people usually show up)
            shortfall_ratio -= np.random.uniform(0.05, 0.10)
        elif e_type == 'holiday':
            # Holidays have high uncertainty
            shortfall_ratio += np.random.uniform(0.10, 0.30)
            
        # Bound shortfall_ratio
        shortfall_ratio = max(-0.1, min(0.6, shortfall_ratio))
        
        # Calculate actual people
        shortfall = int(expected_ppl * shortfall_ratio)
        actual_ppl = expected_ppl - shortfall
        if actual_ppl < 5:
            actual_ppl = 5
            shortfall = expected_ppl - actual_ppl
            
        # Previous surplus history
        prev_surplus = np.random.uniform(0.0, max(5.0, prepared_qty * 0.15))
        
        # Preparation time (hours)
        prep_time = np.random.uniform(1.0, 8.0)
        
        # 3. Model Target: surplus_quantity
        # Surplus depends strongly on:
        # - prepared_quantity * shortfall_ratio
        # - food_category wastage rates (e.g. bakery/cooked meals waste more than other categories)
        # - donor_type (hotels/caterers waste more than supermarkets)
        
        base_surplus = prepared_qty * (shortfall / expected_ppl)
        
        # Add food category factor
        cat_factors = {
            'bakery': 1.15,
            'cooked_meals': 1.25,
            'dairy': 1.05,
            'fresh_produce': 1.10,
            'meat_poultry': 1.10,
            'other': 1.0
        }
        f_cat_factor = cat_factors.get(f_cat, 1.0)
        
        # Add donor type factor
        donor_factors = {
            'restaurant': 1.05,
            'supermarket': 0.90,
            'hotel': 1.20,
            'caterer': 1.25,
            'other': 1.0
        }
        d_type_factor = donor_factors.get(d_type, 1.0)
        
        # Combine relationships
        surplus = (base_surplus * f_cat_factor * d_type_factor) + (0.05 * prev_surplus)
        
        # Add normal noise
        noise = np.random.normal(0, 5.0)
        surplus += noise
        
        # Bounds check
        surplus = max(0.0, min(prepared_qty * 0.9, surplus))
        
        # Round values
        prepared_qty = round(prepared_qty, 2)
        prev_surplus = round(prev_surplus, 2)
        prep_time = round(prep_time, 2)
        surplus = round(surplus, 2)
        
        data.append([
            d_type, f_cat, m_type, d_week, e_type,
            prepared_qty, expected_ppl, actual_ppl,
            prev_surplus, prep_time, surplus
        ])
        
    columns = [
        'donor_type', 'food_category', 'meal_type', 'day_of_week', 'event_type',
        'prepared_quantity', 'expected_people', 'actual_people',
        'previous_surplus', 'preparation_time', 'surplus_quantity'
    ]
    
    df = pd.DataFrame(data, columns=columns)
    
    # Save directory safety check
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # Write to CSV with a header indicating it is simulated academic data
    with open(filename, 'w') as f:
        f.write("# SIMULATED ACADEMIC DATA - FOR PLATFORM SIMULATION AND TESTING ONLY\n")
    df.to_csv(filename, mode='a', index=False)
    
    print(f"Dataset generated successfully at {filename}")
    return df

if __name__ == "__main__":
    generate_dataset()
