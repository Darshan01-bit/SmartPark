import mysql.connector
import pandas as pd


# --------------------------------
# 1. Connect to MySQL
# --------------------------------

connection = mysql.connector.connect(
    host="localhost",
    port=3306,
    user="root",
    password="root",
    database="smartpark"
)


# --------------------------------
# 2. Read confirmed bookings
# --------------------------------

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


# --------------------------------
# 3. Check the data
# --------------------------------

print("Total bookings:", len(data))

print("\nOriginal booking data:")
print(data.head())


# --------------------------------
# 4. Convert start_time to datetime
# --------------------------------

data["start_time"] = pd.to_datetime(data["start_time"])


# --------------------------------
# 5. Extract day of week
# --------------------------------

data["day_of_week"] = data["start_time"].dt.dayofweek


# --------------------------------
# 6. Extract hour
# --------------------------------

data["hour"] = data["start_time"].dt.hour


# --------------------------------
# 7. Add holiday column
# --------------------------------

# For now:
# 0 = normal day
# 1 = holiday

data["is_holiday"] = 0


# --------------------------------
# 8. Count bookings
# --------------------------------

ml_data = (
    data.groupby(
        [
            "parking_id",
            "day_of_week",
            "hour",
            "is_holiday"
        ]
    )
    .size()
    .reset_index(name="vehicles")
)


# --------------------------------
# 9. Display ML dataset
# --------------------------------

print("\nML Dataset:")
print(ml_data)


# --------------------------------
# 10. Save ML dataset
# --------------------------------

ml_data.to_csv(
    "data/mysql_parking_data.csv",
    index=False
)


print("\nML dataset saved successfully!")