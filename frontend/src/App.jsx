import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Payment from "./pages/Payment";

import Home from "./pages/Home";
import Parking from "./pages/Parking";
import Dashboard from "./pages/Dashboard";
import Prediction from "./pages/Prediction";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBookings from "./pages/MyBookings";
import QRScanner from "./pages/QRScanner";

import AdminRoute from "./AdminRoute.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import FinishedBookings from "./pages/FinishedBookings";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Parking + Booking functionality */}
        <Route path="/parking" element={<Parking />} />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* My Bookings */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute>
              <MyBookings />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        {/* QR Scanner - Admin Only */}
        <Route
          path="/qr-scanner"
          element={
            <AdminRoute>
              <QRScanner />
            </AdminRoute>
          }
        />

        {/* Finished Bookings - Admin Only */}
        <Route
          path="/finished-bookings"
          element={
            <AdminRoute>
              <FinishedBookings />
            </AdminRoute>
          }
        />

        {/* AI Prediction */}
        <Route
          path="/prediction"
          element={<Prediction />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Register */}
        <Route
          path="/register"
          element={<Register />}
        />

        {/* Any unknown URL goes to Home */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;