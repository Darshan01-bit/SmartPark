# SmartPark

## Smart Parking Management and AI-Based Demand Prediction Platform

SmartPark is a smart parking management system that helps users find and book parking slots while providing an AI-based parking demand prediction feature.

The project combines a React frontend, Spring Boot backend, MySQL database, and a Python FastAPI machine learning service.

## Project Overview

SmartPark provides the following major features:

- User registration and login
- JWT-based authentication
- Parking location selection
- Real-time parking slot availability
- Parking slot booking
- Booking cancellation
- Demo payment system
- QR code generation for confirmed bookings
- QR code verification for administrators
- Automatic booking completion after the booking time ends
- Admin finished-bookings management
- AI-based parking demand prediction
- Hourly parking demand forecasting
- Random Forest machine learning model

---

## Technologies Used

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Recharts
- QR Code generation

### Backend

- Java
- Spring Boot
- Spring Data JPA
- Spring Security
- JWT Authentication
- Maven

### Database

- MySQL 8.0

### Machine Learning

- Python
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- Random Forest
- Joblib

### Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- MySQL Workbench / MySQL Command Line

---

## System Architecture

SmartPark consists of three main application layers:

```text
                    ┌──────────────────────┐
                    │     React Frontend   │
                    │      Port: 5173      │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │  Spring Boot     │        │  FastAPI ML      │
       │    Backend       │        │    Service       │
       │    Port: 8080    │        │    Port: 8000    │
       └────────┬─────────┘        └────────┬─────────┘
                │                           │
                ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │      MySQL       │        │ Random Forest    │
       │    Database      │        │     Model        │
       │      3306        │        │ parking_model.pkl│
       └──────────────────┘        └──────────────────┘
```

### Application Flow

```text
User
  │
  ▼
React Frontend
  │
  ├──────────────► Spring Boot Backend
  │                       │
  │                       ▼
  │                    MySQL
  │
  └──────────────► FastAPI ML Service
                          │
                          ▼
                   Random Forest Model
                          │
                          ▼
                  Demand Prediction
```

### SmartPark Prediction Flow

```text
Historical Parking Data
          │
          ▼
   Data Preparation
          │
          ▼
   Random Forest Model
          │
          ▼
 parking_model.pkl
          │
          ▼
     FastAPI API
          │
          ▼
    React Frontend
          │
          ▼
Parking Demand Forecast
```

---

## Features

### 1. User Registration and Login

- New users can create an account.
- Registered users can log in using their credentials.
- JWT-based authentication is used for protected features.
- User information and authentication tokens are stored in the browser.

### 2. Parking Location Selection

Users can view available parking locations and select a parking area according to their requirement.

Current parking locations include:

- City Mall Parking — Pune
- Phoenix Mall Parking — Lower Parel, Mumbai
- Thane Station Parking — Thane

### 3. Parking Slot Management

- Displays available parking slots.
- Users can select an available slot.
- Slots are associated with specific parking locations.
- Slot availability is updated after booking and cancellation.

### 4. Parking Booking

Users can:

- Select a parking location.
- Select an available parking slot.
- Select booking date and time.
- Confirm their parking booking.
- View booking details.

The booking information is stored in the MySQL database.

### 5. Demo Payment System

SmartPark includes a demonstration payment process.

Available demo payment methods include:

- UPI
- Card
- Cash

The payment system is intended for project demonstration and does not process real payments.

### 6. Booking Confirmation and QR Code

After a successful booking:

- A booking confirmation is displayed.
- A QR code is generated for the booking.
- The QR code can be used for booking verification.

### 7. Admin QR Verification

Administrators can access the QR Scanner page to verify parking bookings.

The system checks the booking information and displays the verification result.

### 8. Automatic Booking Completion

The Spring Boot backend automatically checks expired bookings.

When a confirmed booking reaches its end time:

```text
CONFIRMED
    ↓
Booking end time reached
    ↓
COMPLETED
    ↓
Parking slot becomes AVAILABLE
```

This process runs automatically using scheduled backend processing.

### 9. Finished Bookings Management

Administrators have access to a separate Finished Bookings page.

The page displays completed bookings with information such as:

- Booking ID
- User name
- User email
- Parking location
- Parking slot
- Start time
- End time
- Booking status

The admin page also provides a notification when new bookings become completed.

### 10. AI-Based Parking Demand Prediction

SmartPark includes a machine learning module for predicting parking demand.

The prediction system uses a Random Forest machine learning model trained using parking data.

The model is stored as:

```text
ml-service/model/parking_model.pkl
```

### 11. Hourly Parking Demand Forecast

The AI prediction page provides a forecast across multiple hours.

The system uses FastAPI to provide prediction results to the React frontend.

The prediction flow is:

```text
React
  ↓
FastAPI
  ↓
Random Forest Model
  ↓
Predicted Parking Demand
  ↓
React Graph
```

The forecast is displayed using a graphical representation of predicted parking demand.

### 12. Admin Access Control

Administrative features are protected separately from normal user features.

Admin-only features include:

- QR Scanner
- Finished Bookings

Normal users cannot access these admin pages.

### 13. Responsive User Interface

The React frontend provides pages for:

- Home
- Login
- Registration
- Parking
- Dashboard
- My Bookings
- Payment
- QR Scanner
- Finished Bookings
- AI Prediction

---

## Project Structure

The SmartPark project is divided into separate frontend, backend, machine learning, and API testing components.

```text
SmartPark/
│
├── backend/
│   └── backend/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/
│       │   │   │   └── com/
│       │   │   │       └── SmartPark/
│       │   │   │           ├── config/
│       │   │   │           ├── controller/
│       │   │   │           ├── model/
│       │   │   │           ├── repository/
│       │   │   │           ├── security/
│       │   │   │           └── BackendApplication.java
│       │   │   │
│       │   │   └── resources/
│       │   │       └── application.properties
│       │   │
│       │   └── test/
│       │
│       ├── pom.xml
│       └── mvnw.cmd
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── ml-service/
│   ├── data/
│   │   ├── parking_data.csv
│   │   ├── parking_training_data.csv
│   │   └── mysql_parking_data.csv
│   │
│   ├── model/
│   │   └── parking_model.pkl
│   │
│   ├── app.py
│   ├── train_model.py
│   ├── prepare_data.py
│   ├── create_ml_data.py
│   ├── generate_training_data.py
│   ├── test_mysql.py
│   └── requirements.txt
│
├── postman/
│   └── API testing collection/files
│
├── .gitignore
└── README.md
```

### Backend

The `backend` directory contains the Spring Boot application.

It handles:

- REST APIs
- User authentication
- Parking management
- Slot management
- Booking management
- QR verification
- Booking completion
- Database communication
- JWT security

### Frontend

The `frontend` directory contains the React application.

It provides the user interface for:

- Registration
- Login
- Parking selection
- Slot selection
- Booking
- Payment
- Dashboard
- My Bookings
- QR Scanner
- Finished Bookings
- AI Prediction

### ML Service

The `ml-service` directory contains the Python machine learning service.

Important files include:

| File/Folder | Purpose |
|---|---|
| `app.py` | FastAPI prediction API |
| `train_model.py` | Trains the Random Forest model |
| `prepare_data.py` | Prepares data for machine learning |
| `generate_training_data.py` | Generates training data |
| `create_ml_data.py` | Creates ML-related data |
| `test_mysql.py` | Tests MySQL-related ML data access |
| `requirements.txt` | Python dependencies |
| `data/` | Parking datasets |
| `model/parking_model.pkl` | Trained Random Forest model |

### Postman

The `postman` directory contains files used for testing the SmartPark backend APIs.

API testing can be used to verify endpoints such as:

- User registration
- User login
- Parking APIs
- Slot APIs
- Booking APIs
- QR verification APIs

---

## Installation and Setup

### Prerequisites

Before running SmartPark, install the following software:

- Git
- Java JDK 21
- Node.js and npm
- Python 3.13
- MySQL 8.0

Verify the installations:

```powershell
git --version
java --version
node --version
npm --version
py --version
```

---

## 1. Clone the Repository

Clone the SmartPark repository from GitHub:

```powershell
git clone https://github.com/Darshan01-bit/SmartPark.git
```

Move into the project directory:

```powershell
cd SmartPark
```

---

## 2. MySQL Database Setup

Start the MySQL server.

Open the MySQL command line:

```powershell
mysql -u root -p
```

If the `mysql` command is not available in PATH, use the MySQL installation path:

```powershell
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

Create the SmartPark database:

```sql
CREATE DATABASE smartpark;
```

Select the database:

```sql
USE smartpark;
```

The Spring Boot application uses the `smartpark` database for storing application data.

---

## 3. Backend Setup — Spring Boot

Open a new PowerShell terminal.

Move to the backend directory:

```powershell
cd SmartPark\backend\backend
```

Set the database password:

```powershell
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
```

Set the JWT secret:

```powershell
$env:JWT_SECRET="YOUR_JWT_SECRET"
```

Run the Spring Boot backend:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8080
```

---

## 4. Frontend Setup — React

Open another PowerShell terminal.

Move to the frontend directory:

```powershell
cd SmartPark\frontend
```

Install the required Node.js packages:

```powershell
npm install
```

Start the React development server:

```powershell
npm run dev
```

The frontend normally runs on:

```text
http://localhost:5173
```

---

## 5. Machine Learning Service Setup — FastAPI

Open another PowerShell terminal.

Move to the ML service directory:

```powershell
cd SmartPark\ml-service
```

Create a Python virtual environment:

```powershell
py -m venv venv
```

Activate the virtual environment:

```powershell
.\venv\Scripts\activate
```

Install the required Python packages:

```powershell
py -m pip install -r requirements.txt
```

Start the FastAPI service:

```powershell
python -m uvicorn app:app --reload --port 8000
```

The ML service runs on:

```text
http://127.0.0.1:8000
```

FastAPI documentation is available at:

```text
http://127.0.0.1:8000/docs
```

The trained Random Forest model is included in the repository:

```text
ml-service/model/parking_model.pkl
```

---

## 6. Running the Complete SmartPark System

For the complete application, run these three services in separate terminals.

### Terminal 1 — Spring Boot

```powershell
cd SmartPark\backend\backend

$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
$env:JWT_SECRET="YOUR_JWT_SECRET"

.\mvnw.cmd spring-boot:run
```

### Terminal 2 — React

```powershell
cd SmartPark\frontend
npm run dev
```

### Terminal 3 — FastAPI

```powershell
cd SmartPark\ml-service
.\venv\Scripts\activate
python -m uvicorn app:app --reload --port 8000
```

Make sure MySQL is also running.

The complete system will then use:

```text
React
http://localhost:5173
       │
       ├──────────────► Spring Boot
       │                http://localhost:8080
       │                       │
       │                       ▼
       │                    MySQL
       │
       └──────────────► FastAPI
                        http://127.0.0.1:8000
                               │
                               ▼
                       Random Forest Model
```

---

## 7. Environment Variables

SmartPark uses environment variables for sensitive local configuration.

### Backend

```text
DB_PASSWORD
JWT_SECRET
```

Example:

```powershell
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
$env:JWT_SECRET="YOUR_JWT_SECRET"
```

Do not commit real passwords, secrets, or other sensitive credentials to GitHub.

---

## API Endpoints

SmartPark uses REST APIs for communication between the frontend, backend, database, and machine learning service.

### Authentication APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/users/register` | Register a new user |
| POST | `/api/users/login` | Authenticate a user and generate a JWT |

### Parking APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/parking` | Get parking locations |
| GET | `/api/parking/{id}` | Get details of a parking location |

### Parking Slot APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/parking/{id}/slots` | Get slots for a parking location |

### Booking APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings` | Get bookings |
| GET | `/api/bookings/{id}` | Get a specific booking |
| GET | `/api/bookings/user/{userId}` | Get bookings for a user |
| DELETE | `/api/bookings/{id}` | Cancel a booking |
| GET | `/api/bookings/completed` | Get completed bookings |

### QR Verification API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/bookings/verify/{id}` | Verify an active booking |

### Machine Learning APIs

The machine learning service is provided through FastAPI.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Check whether the ML service is running |
| GET | `/predict` | Predict parking demand |
| GET | `/forecast` | Generate hourly parking demand forecast |

### Prediction Inputs

The `/predict` endpoint accepts the following inputs:

```text
day_of_week
hour
is_holiday
previous_occupancy
temperature
```

Example:

```text
GET /predict?day_of_week=2&hour=18&is_holiday=0&previous_occupancy=50&temperature=30
```

The API returns the predicted parking demand and occupancy level.

Example response:

```json
{
  "predicted_demand": 57.88,
  "occupancy_level": "MEDIUM"
}
```

### API Communication

The main communication flow is:

```text
React Frontend
      │
      ├──► Spring Boot REST APIs
      │          │
      │          ▼
      │        MySQL
      │
      └──► FastAPI ML APIs
                 │
                 ▼
          Random Forest Model
```

### FastAPI Documentation

FastAPI automatically provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

The Swagger interface can be used to test the ML endpoints.

---

## Machine Learning Model

SmartPark includes an AI-based parking demand prediction system that uses a Random Forest machine learning model.

The machine learning pipeline is:

```text
Parking Dataset
      ↓
Data Preparation
      ↓
Feature Processing
      ↓
Random Forest Training
      ↓
Trained Model
      ↓
parking_model.pkl
      ↓
FastAPI
      ↓
React Frontend
      ↓
Parking Demand Prediction
```

### Training Dataset

The ML service uses parking-related data containing information such as:

- Day of the week
- Hour
- Holiday information
- Previous occupancy
- Temperature
- Parking location
- Parking demand

The training data is stored inside:

```text
ml-service/data/
```

### Data Preparation

The raw parking data is prepared before training the machine learning model.

The preparation process includes:

1. Loading the parking data.
2. Preparing the required features.
3. Converting the data into a format suitable for machine learning.
4. Separating input features and the prediction target.
5. Using the prepared data for model training.

### Random Forest Model

SmartPark uses the **Random Forest Regression** algorithm to predict parking demand.

The model is trained using the prepared parking dataset.

The trained model is saved as:

```text
ml-service/model/parking_model.pkl
```

The model file is included in the GitHub repository so that the FastAPI service can load the already-trained model.

### Model Configuration

The Random Forest model was trained using:

```text
Number of estimators: 200
Maximum depth: 15
Minimum samples per leaf: 2
```

### Model Performance

The trained model achieved approximately:

```text
Mean Absolute Error (MAE): 2.3
R² Score: 0.994
```

These values describe the performance obtained on the dataset used during the project development.

### FastAPI ML Service

The trained model is loaded by the FastAPI application.

```text
app.py
   │
   ▼
parking_model.pkl
   │
   ▼
Prediction
```

The FastAPI service provides endpoints for parking demand prediction and hourly forecasting.

### Prediction Features

The prediction API uses five main input features:

| Feature | Description |
|---|---|
| `day_of_week` | Day of the week |
| `hour` | Hour of the day |
| `is_holiday` | Indicates whether the day is a holiday |
| `previous_occupancy` | Previous parking occupancy |
| `temperature` | Temperature value |

### Prediction Output

The prediction API returns:

- Predicted parking demand
- Occupancy level

Example:

```json
{
  "predicted_demand": 57.88,
  "occupancy_level": "MEDIUM"
}
```

### Hourly Forecast

SmartPark also provides an hourly parking demand forecast.

The forecast endpoint generates predictions for multiple hours and sends the results to the React frontend.

The React application displays these predictions using a line chart.

```text
FastAPI
   ↓
Hourly Predictions
   ↓
React
   ↓
Recharts
   ↓
Parking Demand Forecast Graph
```

### Machine Learning Files

Important ML files include:

| File | Purpose |
|---|---|
| `app.py` | FastAPI ML API |
| `train_model.py` | Trains the Random Forest model |
| `prepare_data.py` | Prepares machine learning data |
| `generate_training_data.py` | Generates training data |
| `create_ml_data.py` | Creates ML-related data |
| `data/` | Training datasets |
| `model/parking_model.pkl` | Trained Random Forest model |
| `requirements.txt` | Python dependencies |

---

## Database Design

SmartPark uses **MySQL 8.0** as its relational database.

The database is named:

```text
smartpark
```

The database stores information related to users, parking locations, parking slots, bookings, and payments.

### Main Database Tables

```text
smartpark
│
├── users
├── parking
├── parking_slots
├── bookings
└── payments
```

### 1. Users

The `users` table stores registered user information.

It is used for:

- User registration
- User login
- User authentication
- Identifying users associated with bookings

### 2. Parking

The `parking` table stores information about parking locations.

It contains information such as:

- Parking location name
- Location
- Total parking capacity
- Available parking slots
- Pricing information

Example parking locations include:

```text
City Mall Parking
Phoenix Mall Parking
Thane Station Parking
```

### 3. Parking Slots

The `parking_slots` table stores individual parking slots belonging to parking locations.

The table is used to:

- Identify individual parking slots
- Track slot availability
- Assign slots to bookings
- Make slots available again after cancellation or booking completion

Example slot identifiers include:

```text
A1
A2
A3
A4
...
```

### 4. Bookings

The `bookings` table stores parking reservation information.

It is used to store information such as:

- User associated with the booking
- Parking location
- Parking slot
- Booking start time
- Booking end time
- Booking status

The booking status can change during the booking lifecycle.

Example:

```text
CONFIRMED
    ↓
Booking end time reached
    ↓
COMPLETED
```

A cancelled booking can also have its status updated through the booking cancellation process.

### 5. Payments

The `payments` table is intended to store payment-related information for the booking system.

SmartPark currently uses a **demo/fake payment system** for project demonstration.

The available demonstration payment methods include:

- UPI
- Card
- Cash

No real payment processing is performed.

### Database Relationship

The main relationship between the tables can be represented as:

```text
                 ┌──────────────┐
                 │    users     │
                 └──────┬───────┘
                        │
                        │
                        ▼
                 ┌──────────────┐
                 │   bookings   │
                 └───┬──────┬───┘
                     │      │
                     │      │
                     ▼      ▼
              ┌──────────┐ ┌──────────────┐
              │ parking  │ │parking_slots │
              └──────────┘ └──────────────┘
                     │
                     │
                     ▼
              ┌──────────────┐
              │   payments   │
              └──────────────┘
```

### Database and Application Flow

The Spring Boot backend communicates with MySQL using Spring Data JPA.

```text
React Frontend
      ↓
Spring Boot REST API
      ↓
Spring Data JPA
      ↓
MySQL
      ↓
smartpark database
```

The database therefore acts as the persistent storage layer for the SmartPark application.

### Database Configuration

The backend connects to MySQL using the following database URL:

```text
jdbc:mysql://localhost:3306/smartpark
```

The database password is provided through an environment variable rather than being stored directly in the source code.

```text
DB_PASSWORD
```

This helps prevent database credentials from being committed to GitHub.

---

## Security

SmartPark uses authentication and access-control mechanisms to protect user and administrator functionality.

### 1. JWT Authentication

SmartPark uses **JSON Web Tokens (JWT)** for user authentication.

The authentication flow is:

```text
User
  ↓
Login
  ↓
Spring Boot Authentication
  ↓
JWT Token Generated
  ↓
Token Stored in Browser
  ↓
Protected API Requests
```

After successful login, the frontend stores the authentication information and JWT token in the browser.

The token is then used when accessing protected application functionality.

### 2. Protected Routes

The React frontend uses protected routes to prevent unauthenticated users from accessing certain pages.

Examples include:

- Dashboard
- My Bookings
- Payment
- Other authenticated user functionality

Users who are not logged in are redirected to the login page when they try to access protected pages.

### 3. Admin Access Control

Administrative functionality is separated from normal user functionality.

Admin-only pages include:

- QR Scanner
- Finished Bookings

These pages are protected using administrator access control.

The general access flow is:

```text
User
  │
  ├── Normal User
  │      └── User Features
  │
  └── Administrator
         └── Admin Features
              ├── QR Scanner
              └── Finished Bookings
```

### 4. Backend Security

The Spring Boot backend uses Spring Security together with JWT authentication.

The backend validates authentication information when protected APIs are accessed.

Public functionality includes operations required for:

- User registration
- User login
- Public parking information

Protected functionality requires authentication.

### 5. Environment Variables

Sensitive configuration values are not stored directly in the GitHub repository.

SmartPark uses environment variables for sensitive values such as:

```text
DB_PASSWORD
JWT_SECRET
```

Example:

```powershell
$env:DB_PASSWORD="YOUR_MYSQL_PASSWORD"
$env:JWT_SECRET="YOUR_JWT_SECRET"
```

The Spring Boot application reads these values from the environment.

### 6. Database Credentials

The MySQL password is not hard-coded into the GitHub repository.

The backend configuration uses:

```properties
spring.datasource.password=${DB_PASSWORD}
```

This allows the actual database password to remain in the local environment instead of being committed to source control.

### 7. JWT Secret

The JWT signing secret is also provided through an environment variable:

```properties
app.jwt.secret=${JWT_SECRET}
```

The actual secret should never be committed to GitHub.

### 8. GitHub Security

The project `.gitignore` is configured to prevent sensitive or local files from being uploaded accidentally.

Examples include:

```text
.env
.env.*
*.sql
*.db
*.sqlite
```

Local database backups and environment configuration files should remain outside the public repository.

### Security Flow

The overall authentication flow can be represented as:

```text
                 ┌──────────────┐
                 │     User     │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │    Login     │
                 └──────┬───────┘
                        │
                        ▼
              ┌───────────────────┐
              │ Spring Security   │
              │   + JWT Service   │
              └─────────┬─────────┘
                        │
                        ▼
                  JWT Token
                        │
                        ▼
                 Protected APIs
                        │
                 ┌──────┴──────┐
                 ▼             ▼
             User APIs      Admin APIs
```

### Important Security Note

The GitHub repository contains the application source code and trained machine learning model, but real passwords, JWT secrets, environment files, and database backups should not be committed to the repository.

---

## How the System Works

SmartPark combines user management, parking reservations, payment simulation, QR verification, automatic booking completion, and AI-based parking demand prediction.

### 1. User Registration

A new user creates an account through the registration page.

```text
Registration Page
       ↓
User Details
       ↓
Spring Boot API
       ↓
MySQL
       ↓
User Account Created
```

### 2. User Login

The user logs into SmartPark using their registered credentials.

```text
Login Page
    ↓
Spring Boot Authentication
    ↓
JWT Token Generated
    ↓
Token Stored in Browser
    ↓
User Dashboard
```

### 3. Select Parking Location

After logging in, the user can view available parking locations.

The user selects a parking location according to their requirement.

```text
Parking Page
     ↓
Available Parking Locations
     ↓
Select Parking
```

### 4. Select Parking Slot

The system displays the parking slots associated with the selected parking location.

The user selects an available slot.

```text
Selected Parking
       ↓
Available Slots
       ↓
Select Slot
```

### 5. Create Booking

The user selects the required booking date and time and confirms the booking.

The booking information is sent to the Spring Boot backend and stored in MySQL.

```text
Parking
   ↓
Slot
   ↓
Date & Time
   ↓
Booking Request
   ↓
Spring Boot
   ↓
MySQL
```

### 6. Demo Payment

After creating the booking, the user proceeds to the demonstration payment page.

The available demonstration methods are:

- UPI
- Card
- Cash

The payment system is only for project demonstration and does not process real payments.

```text
Booking
   ↓
Demo Payment
   ↓
Payment Successful
   ↓
Booking Confirmed
```

### 7. Booking Confirmation

After the demonstration payment is completed, the booking is confirmed.

The user can view the booking details.

A QR code is also generated for the booking.

```text
Payment Successful
       ↓
Booking Confirmed
       ↓
QR Code Generated
```

### 8. QR Code Verification

An administrator can use the QR Scanner page to verify a booking.

```text
QR Code
   ↓
Admin QR Scanner
   ↓
Spring Boot API
   ↓
Booking Verification
   ↓
Verification Result
```

### 9. Parking Usage

The user can use the booked parking slot during the confirmed booking period.

The booking remains in the confirmed state until its end time is reached.

### 10. Automatic Booking Completion

The Spring Boot backend periodically checks confirmed bookings.

When a booking reaches its end time:

```text
CONFIRMED
    ↓
End Time Reached
    ↓
COMPLETED
    ↓
Slot Becomes AVAILABLE
```

The parking availability is also updated when the slot becomes available again.

### 11. Finished Bookings

Completed bookings are displayed on the administrator's Finished Bookings page.

The page can show:

- Booking ID
- User name
- User email
- Parking location
- Parking slot
- Start time
- End time
- Booking status

When new bookings become completed, the admin page displays a notification.

### 12. AI Parking Demand Prediction

SmartPark also provides an AI-based prediction feature.

The React frontend sends prediction information to the FastAPI machine learning service.

```text
React Prediction Page
        ↓
FastAPI
        ↓
Random Forest Model
        ↓
parking_model.pkl
        ↓
Predicted Demand
        ↓
React
        ↓
Prediction Graph
```

### 13. Hourly Parking Forecast

The prediction page can display parking demand predictions across multiple hours.

The forecast is returned by the FastAPI service and displayed in the React frontend using a graph.

```text
FastAPI
   ↓
Hourly Predictions
   ↓
React
   ↓
Recharts
   ↓
Hourly Forecast Graph
```

### Complete SmartPark Workflow

The overall application workflow can be represented as:

```text
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Register /  │
                    │    Login     │
                    └──────┬───────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Select Parking   │
                  │    Location      │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   Select Slot    │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Create Booking   │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   Demo Payment   │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Booking Confirmed│
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   QR Code        │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Parking Usage    │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │   End Time       │
                  │     Reached      │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Booking Completed│
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ Slot Available   │
                  │      Again       │
                  └──────────────────┘
```

### AI Prediction Workflow

The AI system operates separately from the normal booking workflow:

```text
Parking Data
     ↓
Data Preparation
     ↓
Random Forest
     ↓
parking_model.pkl
     ↓
FastAPI
     ↓
React Prediction Page
     ↓
Demand Forecast
```

---

## Testing

SmartPark was tested at different levels to verify the frontend, backend, database, API, authentication, booking, and machine learning functionality.

### 1. Frontend Testing

The React application was tested through the browser.

The following functionality was checked:

- Home page loading
- User registration
- User login
- Dashboard
- Parking location selection
- Parking slot selection
- Booking creation
- Demo payment
- Booking confirmation
- QR code display
- My Bookings
- AI Prediction page
- Hourly forecast graph
- Responsive/mobile layout

The React development server runs at:

```text
http://localhost:5173
```

### 2. Backend API Testing

The Spring Boot REST APIs were tested using Postman and the frontend application.

Important API operations tested include:

- User registration
- User login
- Parking retrieval
- Parking slot retrieval
- Booking creation
- Booking retrieval
- Booking cancellation
- Booking verification
- Completed booking retrieval

The Spring Boot backend runs at:

```text
http://localhost:8080
```

### 3. Postman Testing

Postman was used to test backend API requests independently of the React frontend.

The testing process includes:

```text
Postman
   ↓
Spring Boot REST API
   ↓
MySQL Database
   ↓
API Response
```

This helps verify that the backend APIs work correctly before relying on the frontend.

### 4. Authentication Testing

Authentication was tested by checking:

- User registration
- User login
- JWT token generation
- Access to protected functionality
- Admin-only functionality
- Access restrictions for unauthenticated users

The expected authentication flow is:

```text
Login
  ↓
JWT Token
  ↓
Authenticated Request
  ↓
Protected API
  ↓
Response
```

### 5. MySQL Database Testing

The MySQL database was tested to verify that application data is stored correctly.

Important database operations checked include:

- User creation
- Parking information
- Parking slots
- Booking records
- Booking status updates

The database can be accessed using:

```text
MySQL 8.0
Database: smartpark
```

### 6. FastAPI Testing

The FastAPI machine learning service was tested using its automatically generated Swagger documentation.

Open:

```text
http://127.0.0.1:8000/docs
```

The following endpoints were tested:

```text
GET /
GET /predict
GET /forecast
```

The `/predict` endpoint was verified to return a response containing:

```json
{
  "predicted_demand": 57.88,
  "occupancy_level": "MEDIUM"
}
```

### 7. Machine Learning Testing

The trained Random Forest model was tested through the FastAPI service.

The prediction flow was verified as:

```text
Input Features
      ↓
FastAPI
      ↓
Random Forest Model
      ↓
Prediction
      ↓
JSON Response
```

The trained model is stored at:

```text
ml-service/model/parking_model.pkl
```

### 8. Hourly Forecast Testing

The `/forecast` endpoint was tested to verify that multiple hourly predictions are returned.

The React frontend then displays these values as a parking demand graph.

```text
FastAPI /forecast
       ↓
Hourly Predictions
       ↓
React
       ↓
Recharts
       ↓
Forecast Graph
```

### 9. Booking Completion Testing

The automatic booking completion process was tested by allowing a confirmed booking to reach its end time.

The expected result is:

```text
CONFIRMED
    ↓
End Time Reached
    ↓
COMPLETED
    ↓
Slot AVAILABLE
```

The completed booking should then appear on the administrator's Finished Bookings page.

### 10. QR Verification Testing

The QR code functionality was tested by:

1. Creating a booking.
2. Completing the demonstration payment.
3. Generating the booking QR code.
4. Opening the admin QR Scanner.
5. Scanning/verifying the booking.
6. Checking the verification result.

### 11. Responsive Layout Testing

The frontend was also checked using the browser's device/mobile view.

The following pages can be checked for responsive behavior:

- Home
- Login
- Register
- Parking
- Dashboard
- My Bookings
- Payment
- Prediction
- Finished Bookings

### 12. Final Testing Checklist

Before considering the project ready for demonstration, verify:

- [ ] MySQL is running.
- [ ] `smartpark` database is available.
- [ ] Spring Boot starts successfully.
- [ ] React starts successfully.
- [ ] FastAPI starts successfully.
- [ ] User registration works.
- [ ] User login works.
- [ ] JWT authentication works.
- [ ] Parking locations are displayed.
- [ ] Parking slots are displayed.
- [ ] Booking can be created.
- [ ] Demo payment works.
- [ ] Booking confirmation works.
- [ ] QR code is generated.
- [ ] Admin QR verification works.
- [ ] Booking cancellation works.
- [ ] Confirmed bookings become completed after their end time.
- [ ] Completed bookings appear in Finished Bookings.
- [ ] AI prediction works.
- [ ] Hourly forecast graph works.
- [ ] Mobile/responsive layout works.
- [ ] No sensitive credentials are committed to GitHub.

---

## Screenshots

### Home Page

![SmartPark Home Page](screenshots/01.1-home.png)
![SmartPark Home Page](screenshots/01.2-home.png)
![SmartPark Home Page](screenshots/01.3-home.png)
![SmartPark Home Page](screenshots/01.4-home.png)
![SmartPark Home Page](screenshots/01.5-home.png)

### Login Page

![SmartPark Login Page](screenshots/02-login.png)

### Registration Page

![SmartPark Registration Page](screenshots/03-register.png)

### Parking Page

![SmartPark Parking Page](screenshots/04.1-parking.png)
![SmartPark Parking Page](screenshots/04.2-parking.png)
![SmartPark Parking Page](screenshots/04.3-parking.png)

### Booking and Payment Page

![SmartPark Booking and Payment](screenshots/05.1-booking-payment.png)
![SmartPark Booking and Payment](screenshots/05.2-booking-payment.png)
![SmartPark Booking and Payment](screenshots/05.3-booking-payment.png)
![SmartPark Booking and Payment](screenshots/05.4-booking-payment.png)
![SmartPark Booking and Payment](screenshots/05.5-booking-payment.png)
![SmartPark Booking and Payment](screenshots/05.6-booking-payment.png)

### Dashboard

![SmartPark Dashboard](screenshots/06.1-dashboard.png)
![SmartPark Dashboard](screenshots/06.2-dashboard.png)
![SmartPark Dashboard](screenshots/06.3-dashboard.png)

### My Bookings

![SmartPark My Bookings](screenshots/07.1-mybookings.png)
![SmartPark My Bookings](screenshots/07.2-mybookings.png)
![SmartPark My Bookings](screenshots/07.3-mybookings.png)
![SmartPark My Bookings](screenshots/07.4-mybookings.png)

### QR Scanner

![SmartPark My Bookings](screenshots/08.1-qrscanner.png)
![SmartPark My Bookings](screenshots/08.2-qrscanner.png)
![SmartPark My Bookings](screenshots/08.3-qrscanner.png)
![SmartPark My Bookings](screenshots/08.4-qrscanner.png)

### Finished Bookings

![SmartPark Finished Bookings](screenshots/09.1-finishedbookings.png)
![SmartPark Finished Bookings](screenshots/09.2-finishedbookings.png)

### AI Prediction

![SmartPark AI Prediction](screenshots/10.1-aiprediction.png)
![SmartPark AI Prediction](screenshots/10.2-aiprediction.png)
![SmartPark AI Prediction](screenshots/10.3-aiprediction.png)
![SmartPark AI Prediction](screenshots/10.4-aiprediction.png)
Automated CI/CD trigger verification.
