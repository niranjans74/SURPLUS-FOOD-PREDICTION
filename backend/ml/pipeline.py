import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def train_pipeline(data_path="backend/ml/simulated_surplus_data.csv", model_save_path="backend/ml/best_model.joblib"):
    print("Loading dataset...")
    # Read CSV, skipping comments
    df = pd.read_csv(data_path, comment='#')
    
    X = df.drop(columns=['surplus_quantity'])
    y = df['surplus_quantity']
    
    # Identify numerical and categorical columns
    categorical_cols = ['donor_type', 'food_category', 'meal_type', 'event_type']
    numerical_cols = ['day_of_week', 'prepared_quantity', 'expected_people', 'actual_people', 'previous_surplus', 'preparation_time']
    
    # 2. Preprocessor setup
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numerical_cols),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_cols)
        ]
    )
    
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models = {
        'Linear Regression': LinearRegression(),
        'Decision Tree Regressor': DecisionTreeRegressor(random_state=42, max_depth=8),
        'Random Forest Regressor': RandomForestRegressor(random_state=42, n_estimators=100, max_depth=10)
    }
    
    best_r2 = -float('inf')
    best_model_pipeline = None
    best_model_name = ""
    evaluation_results = {}
    
    for name, model in models.items():
        print(f"Training and evaluating {name}...")
        # Create pipeline
        clf = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('regressor', model)
        ])
        
        clf.fit(X_train, y_train)
        y_pred = clf.predict(X_test)
        
        # Calculate metrics
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        rmse = np.sqrt(mse)
        r2 = r2_score(y_test, y_pred)
        
        evaluation_results[name] = {
            'MAE': round(float(mae), 4),
            'RMSE': round(float(rmse), 4),
            'R2': round(float(r2), 4)
        }
        
        print(f"  MAE: {mae:.2f} kg, RMSE: {rmse:.2f} kg, R2: {r2:.4f}")
        
        if r2 > best_r2:
            best_r2 = r2
            best_model_pipeline = clf
            best_model_name = name
            
    print(f"\nBest performing model: {best_model_name} (R2: {best_r2:.4f})")
    
    # Save the best pipeline
    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    joblib.dump(best_model_pipeline, model_save_path)
    print(f"Saved best model pipeline to {model_save_path}")
    
    # Save metrics report
    report_path = "backend/ml/evaluation_report.txt"
    with open(report_path, "w") as f:
        f.write("SIMULATED SURPLUS FOOD PREDICTION MODEL EVALUATION REPORT\n")
        f.write("========================================================\n\n")
        f.write(f"Best Model Selected: {best_model_name}\n")
        f.write(f"Best Model R2 Score: {best_r2:.4f}\n\n")
        f.write("Model Performance Summary:\n")
        for name, metrics in evaluation_results.items():
            f.write(f"\n{name}:\n")
            f.write(f"  MAE: {metrics['MAE']} kg\n")
            f.write(f"  RMSE: {metrics['RMSE']} kg\n")
            f.write(f"  R2: {metrics['R2']}\n")
            
    print(f"Evaluation report saved to {report_path}")
    return evaluation_results

if __name__ == "__main__":
    train_pipeline()
