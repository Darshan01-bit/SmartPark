import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [parking, setParking] = useState([]);

  // Only used for the first dashboard load
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    const currentUser = JSON.parse(savedUser);

    setUser(currentUser);

    // First load → show loading
    loadDashboard(currentUser, true);

    // Automatic background refresh every 10 seconds
    // No loading screen during these refreshes
    const interval = setInterval(() => {
      loadDashboard(currentUser, false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [navigate]);

  // ==========================================
  // LOAD DASHBOARD DATA
  // ==========================================

  const loadDashboard = async (
    currentUser,
    showLoading = false
  ) => {
    try {
      // Only show loading during the first page load
      if (showLoading) {
        setLoading(true);
      }

      // Clear old error when refreshing successfully
      setError("");

      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const [bookingResponse, parkingResponse] =
        await Promise.all([
          axios.get(
            `http://localhost:8080/api/bookings/user/${currentUser.userId}`,
            config
          ),

          axios.get(
            "http://localhost:8080/api/parking"
          )
        ]);

      // Update dashboard data silently
      setBookings(bookingResponse.data);
      setParking(parkingResponse.data);

    } catch (err) {
      console.error(err);

      setError(
        "Unable to load dashboard data. Please try again."
      );
    } finally {
      // Only hide loading for the initial load
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // ==========================================
  // ACTIVE BOOKINGS
  // ==========================================

  const getActiveBookings = () => {
    return bookings.filter(
      (booking) =>
        booking.status === "CONFIRMED"
    ).length;
  };

  // ==========================================
  // CANCELLED BOOKINGS
  // ==========================================

  const getCancelledBookings = () => {
    return bookings.filter(
      (booking) =>
        booking.status === "CANCELLED"
    ).length;
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (status) => {
    if (status === "CONFIRMED") {
      return "dashboard-status confirmed";
    }

    if (status === "CANCELLED") {
      return "dashboard-status cancelled";
    }

    return "dashboard-status";
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  // ==========================================
  // FIRST LOAD
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-loading">

        <div className="dashboard-spinner"></div>

        <p>
          Loading your dashboard...
        </p>

      </div>
    );
  }

  return (
    <div className="dashboard-page">

      {/* ================= HEADER ================= */}

      <section className="dashboard-header">

        <div>

          <span className="dashboard-label">
            SMARTPARK DASHBOARD
          </span>

          <h1>
            Welcome back
            {user?.name ? `, ${user.name}` : ""} 👋
          </h1>

          <p>
            Manage your parking activity and
            quickly access SmartPark services.
          </p>

        </div>

        <div className="dashboard-header-icon">
          🚗
        </div>

      </section>


      {/* ================= ERROR ================= */}

      {error && (
        <div className="dashboard-error">
          ⚠️ {error}
        </div>
      )}


      {/* ================= STAT CARDS ================= */}

      <section className="dashboard-stats">

        {/* TOTAL BOOKINGS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon blue">
            📋
          </div>

          <div>

            <span>
              Total Bookings
            </span>

            <strong>
              {bookings.length}
            </strong>

          </div>

        </div>


        {/* ACTIVE BOOKINGS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon green">
            ✓
          </div>

          <div>

            <span>
              Active Bookings
            </span>

            <strong>
              {getActiveBookings()}
            </strong>

          </div>

        </div>


        {/* CANCELLED */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon red">
            ✕
          </div>

          <div>

            <span>
              Cancelled
            </span>

            <strong>
              {getCancelledBookings()}
            </strong>

          </div>

        </div>


        {/* PARKING LOCATIONS */}

        <div className="dashboard-stat-card">

          <div className="dashboard-stat-icon purple">
            🅿️
          </div>

          <div>

            <span>
              Parking Locations
            </span>

            <strong>
              {parking.length}
            </strong>

          </div>

        </div>

      </section>


      {/* ================= MAIN GRID ================= */}

      <div className="dashboard-main-grid">


        {/* ================= RECENT BOOKINGS ================= */}

        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-panel-label">
                ACTIVITY
              </span>

              <h2>
                Recent Bookings
              </h2>

            </div>

            <button
              className="dashboard-view-button"
              onClick={() =>
                navigate("/my-bookings")
              }
            >
              View All →
            </button>

          </div>


          {bookings.length === 0 ? (

            <div className="dashboard-empty">

              <div className="dashboard-empty-icon">
                🅿️
              </div>

              <h3>
                No bookings yet
              </h3>

              <p>
                Find a parking location and
                make your first booking.
              </p>

              <button
                onClick={() =>
                  navigate("/parking")
                }
              >
                Find Parking
              </button>

            </div>

          ) : (

            <div className="dashboard-bookings">

              {bookings
                .slice()
                .reverse()
                .slice(0, 5)
                .map((booking) => (

                  <div
                    className="dashboard-booking-row"
                    key={booking.id}
                  >

                    <div className="booking-row-icon">
                      🅿️
                    </div>


                    <div className="booking-row-info">

                      <strong>
                        Booking #{booking.id}
                      </strong>

                      <span>
                        {booking.parkingName ||
                          "Parking Location"}
                      </span>

                    </div>


                    <div className="booking-row-slot">

                      <span>
                        Slot
                      </span>

                      <strong>
                        {booking.slotNumber || "-"}
                      </strong>

                    </div>


                    <div className="booking-row-date">

                      <strong>
                        {formatDate(
                          booking.startTime
                        )}
                      </strong>

                      <span>
                        {formatTime(
                          booking.startTime
                        )}
                      </span>

                    </div>


                    <span
                      className={getStatusClass(
                        booking.status
                      )}
                    >
                      {booking.status}
                    </span>

                  </div>

                ))}

            </div>

          )}

        </section>


        {/* ================= QUICK ACTIONS ================= */}

        <section className="dashboard-panel quick-actions-panel">

          <div className="dashboard-panel-header">

            <div>

              <span className="dashboard-panel-label">
                QUICK ACCESS
              </span>

              <h2>
                Quick Actions
              </h2>

            </div>

          </div>


          <div className="quick-actions">


            {/* FIND PARKING */}

            <button
              className="quick-action"
              onClick={() =>
                navigate("/parking")
              }
            >

              <div className="quick-action-icon blue">
                🅿️
              </div>

              <div>

                <strong>
                  Find Parking
                </strong>

                <span>
                  Browse available parking
                </span>

              </div>

              <b>
                →
              </b>

            </button>


            {/* MY BOOKINGS */}

            <button
              className="quick-action"
              onClick={() =>
                navigate("/my-bookings")
              }
            >

              <div className="quick-action-icon green">
                📋
              </div>

              <div>

                <strong>
                  My Bookings
                </strong>

                <span>
                  View your reservations
                </span>

              </div>

              <b>
                →
              </b>

            </button>


            {/* AI PREDICTION */}

            <button
              className="quick-action"
              onClick={() =>
                navigate("/prediction")
              }
            >

              <div className="quick-action-icon purple">
                📊
              </div>

              <div>

                <strong>
                  AI Prediction
                </strong>

                <span>
                  View parking demand forecast
                </span>

              </div>

              <b>
                →
              </b>

            </button>

          </div>

        </section>

      </div>


      {/* ================= SYSTEM STATUS ================= */}

      <section className="dashboard-system">

        <div className="dashboard-system-header">

          <div>

            <span className="dashboard-panel-label">
              SMARTPARK
            </span>

            <h2>
              System Overview
            </h2>

          </div>

          <div className="system-online">
            <span></span>
            System Online
          </div>

        </div>


        <div className="system-cards">


          {/* PARKING SYSTEM */}

          <div className="system-card">

            <div className="system-card-icon">
              🅿️
            </div>

            <div>

              <strong>
                Parking System
              </strong>

              <span>
                {parking.length} locations available
              </span>

            </div>

            <div className="system-check">
              ✓
            </div>

          </div>


          {/* AI PREDICTION */}

          <div className="system-card">

            <div className="system-card-icon">
              🤖
            </div>

            <div>

              <strong>
                AI Prediction
              </strong>

              <span>
                Demand forecasting available
              </span>

            </div>

            <div className="system-check">
              ✓
            </div>

          </div>


          {/* SECURE BOOKING */}

          <div className="system-card">

            <div className="system-card-icon">
              🔐
            </div>

            <div>

              <strong>
                Secure Booking
              </strong>

              <span>
                JWT authentication enabled
              </span>

            </div>

            <div className="system-check">
              ✓
            </div>

          </div>


        </div>

      </section>


      {/* ================= FOOTER CTA ================= */}

      <section className="dashboard-cta">

        <div>

          <span>
            READY TO PARK?
          </span>

          <h2>
            Find your next parking spot.
          </h2>

          <p>
            Choose a location, select a slot
            and book your parking in seconds.
          </p>

        </div>

        <button
          onClick={() =>
            navigate("/parking")
          }
        >
          Find Parking →
        </button>

      </section>

    </div>
  );
}