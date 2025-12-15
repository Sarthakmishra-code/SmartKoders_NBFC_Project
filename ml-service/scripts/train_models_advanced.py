import pandas as pd
import json
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, accuracy_score

# -----------------------------
# Load cleaned data
# -----------------------------
df = pd.read_csv("data/converted_credit.csv")

# -----------------------------
# Define target & features
# -----------------------------
TARGET_COLUMN = "Loan_Status"

FEATURES = [
    "Gender",
    "Married",
    "Dependents",
    "Education",
    "Self_Employed",
    "ApplicantIncome",
    "CoapplicantIncome",
    "LoanAmount",
    "Loan_Amount_Term",
    "Credit_History",
    "Property_Area"
]

X = df[FEATURES]
y = df[TARGET_COLUMN]

# -----------------------------
# Train / Validation Split
# -----------------------------
X_train, X_val, y_train, y_val = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# -----------------------------
# XGBoost Model
# -----------------------------
model = XGBClassifier(
    n_estimators=250,
    max_depth=4,
    learning_rate=0.05,
    subsample=0.9,
    colsample_bytree=0.9,
    eval_metric="logloss",
    random_state=42
)

model.fit(X_train, y_train)

# -----------------------------
# Evaluation
# -----------------------------
y_pred_proba = model.predict_proba(X_val)[:, 1]
y_pred = model.predict(X_val)

auc = roc_auc_score(y_val, y_pred_proba)
accuracy = accuracy_score(y_val, y_pred)

print(f"AUC: {auc:.3f}")
print(f"Accuracy: {accuracy:.3f}")

# -----------------------------
# Save artifacts
# -----------------------------
joblib.dump(model, "models/loan_eligibility_model.pkl")

with open("models/feature_columns.json", "w") as f:
    json.dump(FEATURES, f)

with open("models/model_meta.json", "w") as f:
    json.dump({
        "model": "XGBoost",
        "dataset": "Kaggle Loan Prediction",
        "target": TARGET_COLUMN,
        "auc": auc,
        "accuracy": accuracy
    }, f, indent=2)

print("✅ Model and artifacts saved successfully")
