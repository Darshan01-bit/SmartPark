import mysql.connector

connection = mysql.connector.connect(
    host="localhost",
    port=3306,
    user="root",
    password="root",
    database="smartpark"
)

cursor = connection.cursor(dictionary=True)

cursor.execute("""
    SELECT *
    FROM bookings
""")

bookings = cursor.fetchall()

print("Total bookings:", len(bookings))

for booking in bookings[:5]:
    print(booking)

cursor.close()
connection.close()