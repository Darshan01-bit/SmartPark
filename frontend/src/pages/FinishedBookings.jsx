import React, { useEffect, useRef, useState } from "react";

export default function FinishedBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stores the IDs of bookings that have already been seen
  const [seenBookingIds, setSeenBookingIds] = useState(() => {
    const saved = localStorage.getItem("finishedBookingIds");

    return saved ? JSON.parse(saved) : [];
  });

  const seenBookingIdsRef = useRef(seenBookingIds);

  // Popup notifications
  const [notifications, setNotifications] = useState([]);

  // Selected parking location
  const [selectedLocation, setSelectedLocation] =
    useState("ALL");

  // ---------------------------------------------------------
  // LOAD COMPLETED BOOKINGS
  // ---------------------------------------------------------
  const loadCompletedBookings = async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:8080/api/bookings/completed",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load completed bookings"
        );
      }

      const data = await response.json();

      setBookings(data);

      // -----------------------------------------------------
      // FIRST LOAD
      // -----------------------------------------------------
      // Existing completed bookings should NOT trigger
      // popup notifications when the admin first opens
      // the page.
      // -----------------------------------------------------

      if (
        seenBookingIdsRef.current.length === 0 &&
        data.length > 0
      ) {
        const currentIds = data.map(
          (booking) => booking.bookingId
        );

        seenBookingIdsRef.current = currentIds;

        setSeenBookingIds(currentIds);

        localStorage.setItem(
          "finishedBookingIds",
          JSON.stringify(currentIds)
        );

        return;
      }

      // -----------------------------------------------------
      // FIND NEWLY COMPLETED BOOKINGS
      // -----------------------------------------------------

      const newBookings = data.filter(
        (booking) =>
          !seenBookingIdsRef.current.includes(
            booking.bookingId
          )
      );

      if (newBookings.length > 0) {

        // Show ALL newly completed bookings
        setNotifications(newBookings);

        // Mark all new bookings as seen
        const updatedSeenIds = [
          ...seenBookingIdsRef.current,
          ...newBookings.map(
            (booking) => booking.bookingId
          ),
        ];

        // Update ref immediately
        seenBookingIdsRef.current = updatedSeenIds;

        // Update React state
        setSeenBookingIds(updatedSeenIds);

        // Save IDs in localStorage
        localStorage.setItem(
          "finishedBookingIds",
          JSON.stringify(updatedSeenIds)
        );
      }
    } catch (error) {
      console.error(
        "Error loading completed bookings:",
        error
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  // ---------------------------------------------------------
  // INITIAL LOAD + AUTO REFRESH
  // ---------------------------------------------------------
  useEffect(() => {
    loadCompletedBookings(true);

    const interval = setInterval(() => {
      loadCompletedBookings(false);
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ---------------------------------------------------------
  // CLOSE NOTIFICATIONS
  // ---------------------------------------------------------
  const closeNotifications = () => {
    setNotifications([]);
  };

  // ---------------------------------------------------------
  // GET UNIQUE LOCATIONS
  // ---------------------------------------------------------
  const locations = [
    ...new Map(
      bookings.map((booking) => [
        booking.parkingName,
        booking.parkingName,
      ])
    ).values(),
  ];

  // ---------------------------------------------------------
  // FILTER BOOKINGS BY LOCATION
  // ---------------------------------------------------------
  const filteredBookings =
    selectedLocation === "ALL"
      ? bookings
      : bookings.filter(
          (booking) =>
            booking.parkingName === selectedLocation
        );

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------
  if (loading) {
    return (
      <div className="finished-bookings-page">
        <h2>Finished Bookings</h2>
        <p>Loading completed bookings...</p>
      </div>
    );
  }

  return (
    <div className="finished-bookings-page">

      {/* =====================================================
          POPUP NOTIFICATION
      ====================================================== */}

      {notifications.length > 0 && (
        <div className="finished-booking-notification">

          <div className="notification-icon">
            🔔
          </div>

          <div className="notification-content">

            <h3>
              {notifications.length === 1
                ? "Booking Finished"
                : `${notifications.length} Bookings Finished`}
            </h3>

            {notifications.map((booking) => (
              <div
                key={booking.bookingId}
                className="notification-booking"
              >

                <p>
                  <strong>
                    Booking #{booking.bookingId}
                  </strong>{" "}
                  has finished.
                </p>

                <p>
                  <strong>User:</strong>{" "}
                  {booking.userName}
                </p>

                <p>
                  <strong>Parking:</strong>{" "}
                  {booking.parkingName}
                </p>

                <p>
                  <strong>Slot:</strong>{" "}
                  {booking.slotNumber}
                </p>

              </div>
            ))}

          </div>

          <button
            className="notification-close"
            onClick={closeNotifications}
          >
            ×
          </button>

        </div>
      )}

      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="finished-bookings-header">

        <div>
          <h1>Finished Bookings</h1>

          <p>
            Completed bookings from all users
          </p>
        </div>

        <div className="completed-count">
          {filteredBookings.length}
          <span>Completed</span>
        </div>

      </div>

      {/* =====================================================
          LOCATION FILTER
      ====================================================== */}

      <div className="finished-bookings-filter">

        <label htmlFor="location-filter">
          Select Location
        </label>

        <select
          id="location-filter"
          value={selectedLocation}
          onChange={(e) =>
            setSelectedLocation(e.target.value)
          }
        >

          <option value="ALL">
            All Locations
          </option>

          {locations.map((location) => (
            <option
              key={location}
              value={location}
            >
              {location}
            </option>
          ))}

        </select>

      </div>

      {/* =====================================================
          NO BOOKINGS
      ====================================================== */}

      {filteredBookings.length === 0 ? (
        <div className="no-finished-bookings">

          <h3>
            {selectedLocation === "ALL"
              ? "No completed bookings"
              : "No completed bookings for this location"}
          </h3>

          <p>
            {selectedLocation === "ALL"
              ? "Finished bookings will appear here automatically."
              : `There are no finished bookings for ${selectedLocation}.`}
          </p>

        </div>
      ) : (

        /* ===================================================
           BOOKINGS LIST
        ==================================================== */

        <div className="finished-bookings-list">

          {filteredBookings.map((booking) => (

            <div
              className="finished-booking-card"
              key={booking.bookingId}
            >

              <div className="finished-booking-top">

                <h3>
                  Booking #{booking.bookingId}
                </h3>

                <span className="completed-badge">
                  COMPLETED
                </span>

              </div>

              <div className="finished-booking-details">

                <div>
                  <strong>User</strong>
                  <p>
                    {booking.userName}
                  </p>
                </div>

                <div>
                  <strong>Email</strong>
                  <p>
                    {booking.userEmail}
                  </p>
                </div>

                <div>
                  <strong>Parking</strong>
                  <p>
                    {booking.parkingName}
                  </p>
                </div>

                <div>
                  <strong>Location</strong>
                  <p>
                    {booking.parkingLocation}
                  </p>
                </div>

                <div>
                  <strong>Slot</strong>
                  <p>
                    {booking.slotNumber}
                  </p>
                </div>

                <div>
                  <strong>Start Time</strong>
                  <p>
                    {new Date(
                      booking.startTime
                    ).toLocaleString()}
                  </p>
                </div>

                <div>
                  <strong>End Time</strong>
                  <p>
                    {new Date(
                      booking.endTime
                    ).toLocaleString()}
                  </p>
                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}