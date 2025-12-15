"""
Script to train ML models for credit scoring and loan eligibility
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
from pathlib import Path

def generate_synthetic_data(n_samples=5000):
    """
    Generate synthetic training data for demonstration
    In production, use real historical loan data
    """
    np.random.seed(42)
    
    # Generate features
    data = {
        'monthly_income': np.random.uniform(25000, 200000, n_samples),
        'existing_loans': np.random.choice([0, 1, 2, 3], n_samples, p=[0.4, 0.3, 0.2, 0.1]),
        'loan_amount': np.random.uniform(50000, 2000000, n_samples),
        'tenure_months': np.random.choice([12, 24, 36, 48, 60], n_samples),
        'age': np.random.randint(21, 65, n_samples),
        'existing_emi': np.random.uniform(0, 50000, n_samples),
        'employment_type': np.random.choice(['salaried', 'self_employed'], n_samples, p=[0.7, 0.3])
    }
    
    df = pd.DataFrame(data)
    
    # Calculate derived features
    df['loan_to_income_ratio'] = df['loan_amount'] / (df['monthly_income'] * 12)
    df['emi_to_income_ratio'] = df['existing_emi'] / df['monthly_income']
    
    # Generate target: credit score (rule-based for demo)
    credit_scores = []
    for _, row in df.iterrows():
        score = 700
        
        # Income impact
        if row['monthly_income'] >= 100000:
            score += 50
        elif row['monthly_income'] >= 50000:
            score += 30
        elif row['monthly_income'] < 30000:
            score -= 40
        
        # Loan to income ratio
        if row['loan_to_income_ratio'] > 5:
            score -= 50
        elif row['loan_to_income_ratio'] > 3:
            score -= 25
        
        # Existing loans
        score -= row['existing_loans'] * 20
        
        # EMI ratio
        if row['emi_to_income_ratio'] > 0.4:
            score -= 40
        elif row['emi_to_income_ratio'] > 0.25:
            score -= 20
        
        # Employment type
        if row['employment_type'] == 'self_employed':
            score -= 15
        
        # Age factor
        if 25 <= row['age'] <= 45:
            score += 10
        
        # Add some randomness
        score += np.random.randint(-30, 30)
        
        credit_scores.append(np.clip(score, 300, 900))
    
    df['credit_score'] = credit_scores
    
    return df

def train_credit_score_model():
    """Train credit score prediction model"""
    print("Generating training data...")
    df = generate_synthetic_data()
    
    # Prepare features
    feature_cols = [
        'monthly_income', 'existing_loans', 'loan_amount', 
        'tenure_months', 'age', 'existing_emi',
        'loan_to_income_ratio', 'emi_to_income_ratio'
    ]
    
    # Encode categorical variables
    le = LabelEncoder()
    df['employment_type_encoded'] = le.fit_transform(df['employment_type'])
    feature_cols.append('employment_type_encoded')
    
    X = df[feature_cols]
    y = df['credit_score']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train model
    print("Training Random Forest Regressor...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    train_score = model.score(X_train, y_train)
    test_score = model.score(X_test, y_test)
    
    print(f"Training R² Score: {train_score:.4f}")
    print(f"Testing R² Score: {test_score:.4f}")
    
    # Save model
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    model_path = models_dir / "credit_score_model.joblib"
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")
    
    return model

if __name__ == "__main__":
    print("Starting model training...")
    train_credit_score_model()
    print("Training complete!")