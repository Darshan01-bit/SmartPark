import pandas as pd
import random
from datetime import datetime, timedelta

random.seed(42)

parking_info = {
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

start_date = datetime(2026, 7, 1)
days = 90

records = []

for day in range(days):

    current_date = start_date + timedelta(days=day)

    day_of_week = current_date.weekday()

    # Saturday = 5, Sunday = 6
    weekend = day_of_week >= 5

    # Random holidays
    is_holiday = 1 if random.random() < 0.08 else 0

    for parking_id, info in parking_info.items():

        capacity = info["capacity"]

        for hour in range(24):

            # Base demand depending on time
            if 7 <= hour <= 9:
                base_demand = 0.45
            elif 10 <= hour <= 12:
                base_demand = 0.60
            elif 13 <= hour <= 16:
                base_demand = 0.35
            elif 17 <= hour <= 20:
                base_demand = 0.75
            elif 21 <= hour <= 22:
                base_demand = 0.50
            elif 23 <= hour or hour <= 5:
                base_demand = 0.10
            else:
                base_demand = 0.20

            # Weekend effect
            if weekend:
                base_demand += 0.15

            # Holiday effect
            if is_holiday:
                base_demand += 0.20

            # Parking-specific behavior
            if parking_id == 1:
                # Large mall parking
                demand_factor = 1.0

            elif parking_id == 4:
                # Smaller mall parking
                demand_factor = 0.75

            else:
                # Station parking
                demand_factor = 0.65

            # Generate realistic demand
            demand = int(
                capacity *
                base_demand *
                demand_factor
            )

            # Add some natural variation
            variation = random.randint(
                -max(1, int(capacity * 0.05)),
                max(1, int(capacity * 0.05))
            )

            demand += variation

            # Keep demand within capacity
            demand = max(0, min(demand, capacity))

            records.append({
                "date": current_date.date(),
                "parking_id": parking_id,
                "day_of_week": day_of_week,
                "hour": hour,
                "is_holiday": is_holiday,
                "vehicles": demand
            })


df = pd.DataFrame(records)

df = df.sort_values(
    ["date", "parking_id", "hour"]
)

df.to_csv(
    "data/parking_training_data.csv",
    index=False
)

print("\nTraining dataset generated successfully!")

print("\nDataset shape:")
print(df.shape)

print("\nFirst 20 rows:")
print(df.head(20))

print("\nParking distribution:")
print(df["parking_id"].value_counts())

print("\nDemand statistics:")
print(df.groupby("parking_id")["vehicles"].describe())

print("\nSaved to:")
print("data/parking_training_data.csv")