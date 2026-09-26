from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import joblib
import pandas as pd

app = FastAPI(
    title="SmartPark AI Prediction API"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# Load trained model
# ==========================================

model = joblib.load(
    "model/parking_model.pkl"
)


# ==========================================
# Parking information
# ==========================================

PARKING_INFO = {
    1: {
        "name": "City Mall Parking",
        "capacity": 200
    },
    4: {
        "name": "Phoenix Mall Parking",
        "capacity": 15
    },
    5: {
        "name": "Thane Station Parking",
        "capacity": 5
    }
}


# ==========================================
# Helper function
# ==========================================

def get_occupancy_level(prediction, capacity):

    percentage = (prediction / capacity) * 100

    if percentage < 40:
        return "LOW"

    elif percentage < 70:
        return "MEDIUM"

    else:
        return "HIGH"


# ==========================================
# Home
# ==========================================

@app.get("/")
def home():

    return {
        "message": "SmartPark AI Prediction API is running"
    }


# ==========================================
# Single prediction
# ==========================================

@app.get("/predict")
def predict(
    parking_id: int,
    day_of_week: int,
    hour: int,
    is_holiday: int
):

    # Check parking
    if parking_id not in PARKING_INFO:

        return {
            "error": "Invalid parking_id",
            "available_parking_ids": list(
                PARKING_INFO.keys()
            )
        }


    parking = PARKING_INFO[parking_id]

    capacity = parking["capacity"]


    # Create input data

    data = pd.DataFrame([
        {
            "parking_id": parking_id,
            "day_of_week": day_of_week,
            "hour": hour,
            "is_holiday": is_holiday
        }
    ])


    # Predict

    prediction = model.predict(data)[0]

    prediction = max(
        0,
        min(float(prediction), capacity)
    )


    # Occupancy level

    occupancy_level = get_occupancy_level(
        prediction,
        capacity
    )


    occupancy_percentage = (
        prediction / capacity
    ) * 100


    return {

        "parking_id": parking_id,

        "parking_name": parking["name"],

        "capacity": capacity,

        "day_of_week": day_of_week,

        "hour": hour,

        "predicted_demand": round(
            prediction,
            2
        ),

        "occupancy_percentage": round(
            occupancy_percentage,
            2
        ),

        "occupancy_level": occupancy_level
    }


# ==========================================
# 5-hour forecast
# ==========================================

@app.get("/forecast")
def forecast(
    parking_id: int,
    day_of_week: int,
    start_hour: int,
    is_holiday: int
):

    # Check parking

    if parking_id not in PARKING_INFO:

        return {
            "error": "Invalid parking_id",
            "available_parking_ids": list(
                PARKING_INFO.keys()
            )
        }


    parking = PARKING_INFO[parking_id]

    capacity = parking["capacity"]


    forecast_data = []


    # Generate 5 predictions

    for i in range(5):

        hour = start_hour + i

        current_day = day_of_week


        # Move to next day

        if hour >= 24:

            hour = hour - 24

            current_day = (
                day_of_week + 1
            ) % 7


        # Create input

        data = pd.DataFrame([
            {
                "parking_id": parking_id,
                "day_of_week": current_day,
                "hour": hour,
                "is_holiday": is_holiday
            }
        ])


        # Prediction

        prediction = model.predict(data)[0]

        prediction = max(
            0,
            min(float(prediction), capacity)
        )


        # Occupancy

        occupancy_level = get_occupancy_level(
            prediction,
            capacity
        )


        occupancy_percentage = (
            prediction / capacity
        ) * 100


        forecast_data.append({

            "hour": hour,

            "predicted_demand": round(
                prediction,
                2
            ),

            "occupancy_percentage": round(
                occupancy_percentage,
                2
            ),

            "occupancy_level": occupancy_level
        })


    return {

        "parking_id": parking_id,

        "parking_name": parking["name"],

        "capacity": capacity,

        "forecast": forecast_data

    }