import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score


# ==========================================
# 1. Load training dataset
# ==========================================

data = pd.read_csv(
    "data/parking_training_data.csv"
)

print("\n========================================")
print("SMARTPARK AI MODEL TRAINING")
print("========================================")

print("\nDataset shape:")
print(data.shape)

print("\nFirst 10 rows:")
print(data.head(10))


# ==========================================
# 2. Select features
# ==========================================

X = data[
    [
        "parking_id",
        "day_of_week",
        "hour",
        "is_holiday"
    ]
]

y = data["vehicles"]


# ==========================================
# 3. Split dataset
# ==========================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# ==========================================
# 4. Create Random Forest model
# ==========================================

model = RandomForestRegressor(
    n_estimators=200,
    max_depth=15,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1
)


# ==========================================
# 5. Train model
# ==========================================

print("\nTraining Random Forest...")

model.fit(
    X_train,
    y_train
)

print("Training completed!")


# ==========================================
# 6. Make predictions
# ==========================================

predictions = model.predict(X_test)


# ==========================================
# 7. Evaluate model
# ==========================================

mae = mean_absolute_error(
    y_test,
    predictions
)

r2 = r2_score(
    y_test,
    predictions
)

print("\n========================================")
print("MODEL EVALUATION")
print("========================================")

print(
    "Mean Absolute Error:",
    round(mae, 2)
)

print(
    "R2 Score:",
    round(r2, 3)
)


# ==========================================
# 8. Save model
# ==========================================

joblib.dump(
    model,
    "model/parking_model.pkl"
)

print("\n========================================")
print("MODEL SAVED")
print("========================================")

print(
    "model/parking_model.pkl"
)

print("\nRandom Forest retraining completed successfully!")