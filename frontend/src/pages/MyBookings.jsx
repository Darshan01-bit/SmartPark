// MyBookings.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState(null);

  // ==========================================
  // LOAD BOOKINGS
  // ==========================================

  useEffect(() => {
    // First load:
    // Show the loading screen
    getMyBookings(true);

    // Automatic refresh every 10 seconds:
    // Refresh silently without showing loading
    const interval = setInterval(() => {
      getMyBookings(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const getMyBookings = async (showLoading = false) => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!savedUser || !token) {
      setMessage("Please login to view your bookings.");

      if (showLoading) {
        setLoading(false);
      }

      return;
    }

    const user = JSON.parse(savedUser);

    try {
      // Only show loading during the first page load
      if (showLoading) {
        setLoading(true);
      }

      const response = await axios.get(
        `http://localhost:8080/api/bookings/user/${user.userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update bookings silently
      setBookings(response.data);
      setMessage("");
    } catch (error) {
      console.log("Load bookings error:", error);

      if (error.response?.status === 401) {
        setMessage("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        setMessage("You are not authorized to view your bookings.");
      } else {
        setMessage("Failed to load bookings.");
      }
    } finally {
      // Only remove the loading screen for the initial load
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  const cancelBooking = async (bookingId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmCancel) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Please login again.");
      return;
    }

    try {
      setCancelingId(bookingId);
      setMessage("");

      const response = await axios.delete(
        `http://localhost:8080/api/bookings/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(
        response.data.message || "Booking cancelled successfully."
      );

      // Refresh silently after cancellation
      await getMyBookings(false);
    } catch (error) {
      console.log("Cancel booking error:", error);

      if (error.response?.status === 401) {
        setMessage("Session expired. Please login again.");
      } else if (error.response?.status === 403) {
        setMessage(
          "You are not authorized to cancel this booking."
        );
      } else {
        setMessage(
          error.response?.data?.message ||
            "Failed to cancel booking."
        );
      }
    } finally {
      setCancelingId(null);
    }
  };

  // ==========================================
  // BOOKING FILTERS
  // ==========================================

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "CONFIRMED"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "CANCELLED"
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "COMPLETED"
  );

  const filteredBookings =
    filter === "ALL"
      ? bookings
      : bookings.filter(
          (booking) => booking.status === filter
        );

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // CREATE QR DATA
  // ==========================================

  const createQRData = (booking) => {
    return JSON.stringify({
      bookingId: booking.id,
      parkingId: booking.parkingId,
      parkingName: booking.parkingName,
      slotId: booking.slotId,
      slotNumber: booking.slotNumber,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
    });
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="my-bookings-page">

      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <section className="my-bookings-header">

        <div>
          <span className="my-bookings-label">
            SMARTPARK
          </span>

          <h1>My Bookings</h1>

          <p>
            Manage your parking reservations, view booking
            details and access your QR codes.
          </p>
        </div>

        <div className="my-bookings-header-icon">
          🎫
        </div>

      </section>


      {/* ======================================
          MESSAGE
      ======================================= */}

      {message && (
        <div
          className={
            message.includes("successfully") ||
            message.includes("cancelled")
              ? "my-bookings-message success"
              : "my-bookings-message error"
          }
        >
          {message}
        </div>
      )}


      {/* ======================================
          SUMMARY CARDS
      ======================================= */}

      <section className="booking-summary-cards">

        {/* TOTAL */}

        <div className="booking-summary-card">

          <div className="booking-summary-icon blue">
            📋
          </div>

          <div>
            <span>Total Bookings</span>

            <strong>
              {bookings.length}
            </strong>
          </div>

        </div>


        {/* CONFIRMED */}

        <div className="booking-summary-card">

          <div className="booking-summary-icon green">
            ✓
          </div>

          <div>
            <span>Confirmed</span>

            <strong>
              {confirmedBookings.length}
            </strong>
          </div>

        </div>


        {/* CANCELLED */}

        <div className="booking-summary-card">

          <div className="booking-summary-icon red">
            ✕
          </div>

          <div>
            <span>Cancelled</span>

            <strong>
              {cancelledBookings.length}
            </strong>
          </div>

        </div>


        {/* COMPLETED */}

        <div className="booking-summary-card">

          <div className="booking-summary-icon completed">
            ✓
          </div>

          <div>
            <span>Completed</span>

            <strong>
              {completedBookings.length}
            </strong>
          </div>

        </div>

      </section>


      {/* ======================================
          FILTER SECTION
      ======================================= */}

      <section className="booking-filter-section">

        {/* TITLE */}

        <div>
          <span className="my-bookings-label">
            RESERVATIONS
          </span>

          <h2>
            Your Parking History
          </h2>
        </div>


        {/* ==================================
            FOUR FILTER BUTTONS
            ================================== */}

        <div
          className="booking-filters"
          style={{
            display: "flex",
            flexDirection: "row",
            flexWrap: "nowrap",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "8px",
            whiteSpace: "nowrap",
          }}
        >

          {/* ALL */}

          <button
            type="button"
            className={
              filter === "ALL"
                ? "booking-filter active"
                : "booking-filter"
            }
            onClick={() => setFilter("ALL")}
            style={{
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            All

            <span>
              {bookings.length}
            </span>
          </button>


          {/* CONFIRMED */}

          <button
            type="button"
            className={
              filter === "CONFIRMED"
                ? "booking-filter active"
                : "booking-filter"
            }
            onClick={() => setFilter("CONFIRMED")}
            style={{
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Confirmed

            <span>
              {confirmedBookings.length}
            </span>
          </button>


          {/* CANCELLED */}

          <button
            type="button"
            className={
              filter === "CANCELLED"
                ? "booking-filter active"
                : "booking-filter"
            }
            onClick={() => setFilter("CANCELLED")}
            style={{
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Cancelled

            <span>
              {cancelledBookings.length}
            </span>
          </button>


          {/* COMPLETED */}

          <button
            type="button"
            className={
              filter === "COMPLETED"
                ? "booking-filter active"
                : "booking-filter"
            }
            onClick={() => setFilter("COMPLETED")}
            style={{
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Completed

            <span>
              {completedBookings.length}
            </span>
          </button>

        </div>

      </section>


      {/* ======================================
          LOADING
      ======================================= */}

      {loading && (
        <div className="my-bookings-loading">

          <div className="my-bookings-spinner"></div>

          <p>
            Loading your bookings...
          </p>

        </div>
      )}


      {/* ======================================
          EMPTY STATE
      ======================================= */}

      {!loading &&
        filteredBookings.length === 0 &&
        !message && (

          <section className="bookings-empty">

            <div className="bookings-empty-icon">
              🅿️
            </div>

            <h2>
              No bookings found
            </h2>

            <p>
              {filter === "ALL"
                ? "You haven't made any parking bookings yet."
                : `You don't have any ${filter.toLowerCase()} bookings.`}
            </p>

            <button
              onClick={() => {
                window.location.href = "/parking";
              }}
            >
              Find Parking →
            </button>

          </section>
        )}


      {/* ======================================
          BOOKINGS
      ======================================= */}

      {!loading &&
        filteredBookings.length > 0 && (

          <section className="bookings-list">

            {filteredBookings
              .slice()
              .reverse()
              .map((booking) => {

                const qrData = createQRData(booking);

                return (

                  <article
                    className="professional-booking-card"
                    key={booking.id}
                  >

                    {/* =================================
                        CARD HEADER
                    ================================= */}

                    <div className="booking-card-header">

                      <div className="booking-card-title">

                        <div className="booking-card-icon">
                          🅿️
                        </div>

                        <div>

                          <span>
                            BOOKING
                          </span>

                          <h3>
                            #{booking.id}
                          </h3>

                        </div>

                      </div>


                      {/* STATUS */}

                      <span
                        className={
                          booking.status === "CONFIRMED"
                            ? "booking-status confirmed"
                            : booking.status === "CANCELLED"
                              ? "booking-status cancelled"
                              : "booking-status completed"
                        }
                      >
                        {booking.status}
                      </span>

                    </div>


                    {/* =================================
                        BOOKING DETAILS
                    ================================= */}

                    <div className="booking-card-body">

                      {/* PARKING LOCATION */}

                      <div className="booking-detail">

                        <span>
                          PARKING LOCATION
                        </span>

                        <strong>
                          🚗 {booking.parkingName}
                        </strong>

                        {booking.parkingLocation && (
                          <small>
                            📍 {booking.parkingLocation}
                          </small>
                        )}

                      </div>


                      {/* PARKING SLOT */}

                      <div className="booking-detail">

                        <span>
                          PARKING SLOT
                        </span>

                        <strong>
                          🅿 {booking.slotNumber}
                        </strong>

                      </div>


                      {/* DATE */}

                      <div className="booking-detail">

                        <span>
                          DATE
                        </span>

                        <strong>
                          📅 {formatDate(
                            booking.startTime
                          )}
                        </strong>

                      </div>


                      {/* TIME */}

                      <div className="booking-detail">

                        <span>
                          TIME
                        </span>

                        <strong>

                          🕐 {formatTime(
                            booking.startTime
                          )}

                          {" — "}

                          {formatTime(
                            booking.endTime
                          )}

                        </strong>

                      </div>

                    </div>


                    {/* =================================
                        FOOTER
                    ================================= */}

                    <div className="booking-card-footer">

                      {/* QR CODE */}

                      {booking.status === "CONFIRMED" && (

                        <div className="booking-qr-section">

                          <div className="booking-qr-box">

                            <QRCodeCanvas
                              value={qrData}
                              size={120}
                              bgColor="#ffffff"
                              fgColor="#000000"
                              level="H"
                            />

                          </div>

                          <div>

                            <strong>
                              Entry QR Code
                            </strong>

                            <p>
                              Show this QR code at the
                              parking entrance for verification.
                            </p>

                          </div>

                        </div>

                      )}


                      {/* CANCEL BUTTON */}

                      {booking.status === "CONFIRMED" && (

                        <div className="booking-actions">

                          <button
                            className="cancel-booking-button"
                            onClick={() =>
                              cancelBooking(booking.id)
                            }
                            disabled={
                              cancelingId === booking.id
                            }
                          >
                            {cancelingId === booking.id
                              ? "Cancelling..."
                              : "Cancel Booking"}
                          </button>

                        </div>

                      )}

                    </div>

                  </article>

                );
              })}

          </section>

        )}

    </div>
  );
}