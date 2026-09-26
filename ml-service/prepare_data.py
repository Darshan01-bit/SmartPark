import mysql.connector
import pandas as pd


# Connect to SmartPark MySQL
connection = mysql.connector.connect(
    host="localhost",
    port=3306,
    user="root",
    password="root",
    database="smartpark"
)


query = """
SELECT
    id,
    start_time,
    end_time,
    status,
    parking_id,
    slot_id
FROM bookings
WHERE status = 'CONFIRMED'
"""


data = pd.read_sql(query, connection)

connection.close()


print("\nTotal confirmed bookings:", len(data))

print("\nOriginal booking data:")
print(data.head())


# Convert start_time
data["start_time"] = pd.to_datetime(data["start_time"])


# Extract date/time features
data["date"] = data["start_time"].dt.date
data["day_of_week"] = data["start_time"].dt.dayofweek
data["hour"] = data["start_time"].dt.hour


# Holiday flag
# Currently 0 because we do not have a holiday calendar yet.
data["is_holiday"] = 0


# Create daily/hourly demand
training_data = (
    data
    .groupby(
        [
            "date",
            "parking_id",
            "day_of_week",
            "hour",
            "is_holiday"
        ]
    )
    .size()
    .reset_index(name="vehicles")
)


# Sort data
training_data = training_data.sort_values(
    ["parking_id", "date", "hour"]
)


print("\nML Training Data:")
print(training_data)


print("\nTraining rows:", len(training_data))


# Save dataset
training_data.to_csv(
    "data/mysql_parking_data.csv",
    index=False
)


print("\nTraining dataset saved successfully!")