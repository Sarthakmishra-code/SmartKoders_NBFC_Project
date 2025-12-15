import pandas as pd
import numpy as np

# -----------------------------
# Load raw dataset
# -----------------------------
df = pd.read_csv("data/Loan_Data.csv")

# -----------------------------
# Drop ID column
# -----------------------------
df.drop(columns=["Loan_ID"], inplace=True)

# -----------------------------
# Handle Missing Values
# -----------------------------
# Numerical columns
num_cols = [
    "ApplicantIncome", "CoapplicantIncome",
    "LoanAmount", "Loan_Amount_Term", "Credit_History"
]

for col in num_cols:
    df[col].fillna(df[col].median(), inplace=True)

# Categorical columns
cat_cols = [
    "Gender", "Married", "Dependents",
    "Education", "Self_Employed", "Property_Area"
]

for col in cat_cols:
    df[col].fillna(df[col].mode()[0], inplace=True)

# -----------------------------
# Encode Binary Columns
# -----------------------------
df["Gender"] = df["Gender"].map({"Male": 1, "Female": 0})
df["Married"] = df["Married"].map({"Yes": 1, "No": 0})
df["Education"] = df["Education"].map({"Graduate": 1, "Not Graduate": 0})
df["Self_Employed"] = df["Self_Employed"].map({"Yes": 1, "No": 0})

# -----------------------------
# Dependents (convert "3+" → 3)
# -----------------------------
df["Dependents"] = df["Dependents"].replace("3+", 3).astype(int)

# -----------------------------
# Property Area Encoding
# -----------------------------
df["Property_Area"] = df["Property_Area"].map({
    "Rural": 0,
    "Semiurban": 1,
    "Urban": 2
})

# -----------------------------
# Target Variable
# -----------------------------
df["Loan_Status"] = df["Loan_Status"].map({"Y": 1, "N": 0})

# -----------------------------
# Save cleaned dataset
# -----------------------------
df.to_csv("data/converted_credit.csv", index=False)

print("✅ Dataset cleaned and saved as converted_credit.csv")
print(df.head())
