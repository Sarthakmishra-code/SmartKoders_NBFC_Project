from fastapi import FastAPI
import joblib
import json
import numpy as np

# -----------------------------
# App initialization
# -----------------------------
app = FastAPI(title="Loan Eligibility ML Service")

# -----------------------------
# Load model & feature contract
# -----------------------------
model = joblib.load("models/loan_eligibility_model.pkl")

with open("models/feature_columns.json", "r") as f:
    FEATURES = json.load(f)

# -----------------------------
# Risk bucket function
# -----------------------------
def risk_bucket(probability: float) -> str:
    if probability >= 0.75:
        return "LOW"
    elif probability >= 0.50:
        return "MEDIUM"
    else:
        return "HIGH"

# -----------------------------
# Health check
# -----------------------------
@app.get("/health")
def health():
    return {"status": "ok"}

# -----------------------------
# Prediction endpoint
# -----------------------------
@app.post("/predict")
def predict(input_data: dict):
    """
    Expects JSON with all required features
    """

    # Ensure feature order matches training
    x = np.array([input_data[f] for f in FEATURES], dtype=float).reshape(1, -1)

    # Model inference
    probability = float(model.predict_proba(x)[0][1])  
    approved = bool(probability >= 0.60)               

    return {
        "approved": approved,
        "probability": round(probability, 3),
        "risk_bucket": risk_bucket(probability)
    }
