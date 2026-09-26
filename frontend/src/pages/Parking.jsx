import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  useLocation,
  useNavigate
} from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

export default function Parking() {
  const location = useLocation();
  const navigate = useNavigate();

  // ==========================================
  // STATE
  // ==========================================

  const [parking, setParking] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedParking, setSelectedParking] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // ==========================================
  // LOAD PARKING WHEN PAGE OPENS
  // ==========================================

  useEffect(() => {
    getParking();
  }, []);

  // ==========================================
  // AUTOMATICALLY REFRESH PARKING & SLOTS
  // ==========================================

  useEffect(() => {
    // Refresh parking availability every 10 seconds
    const parkingInterval = setInterval(() => {
      getParking();
    }, 10000);

    // Refresh slots every 10 seconds
    let slotInterval = null;

    if (selectedParking) {
      slotInterval = setInterval(() => {
        getSlots(selectedParking.id);
      }, 10000);
    }

    // Stop the timers when leaving the page
    // or changing the selected parking
    return () => {
      clearInterval(parkingInterval);

      if (slotInterval) {
        clearInterval(slotInterval);
      }
    };
  }, [selectedParking]);

  // ==========================================
  // HANDLE PAYMENT SUCCESS
  // ==========================================

  useEffect(() => {
    if (
      location.state?.paymentSuccess &&
      location.state?.booking
    ) {
      const booking = location.state.booking;

      const bookingData = location.state.bookingData;

      const parkingId =
        booking.parkingId ||
        bookingData?.parkingId;

      // ==========================================
      // CREATE CONFIRMED BOOKING DATA
      // ==========================================

      setConfirmedBooking({
        id: booking.id,

        parkingName:
          booking.parkingName ||
          bookingData?.parkingName,

        slotNumber:
          booking.slotNumber ||
          bookingData?.slotNumber,

        startTime:
          booking.startTime ||
          bookingData?.startTime,

        endTime:
          booking.endTime ||
          bookingData?.endTime,

        parkingId: parkingId,

        pricePerHour:
          bookingData?.pricePerHour,

        duration:
          bookingData?.duration,

        amount:
          bookingData?.amount,

        paymentMethod:
          location.state.paymentMethod ||
          ""
      });

      // ==========================================
      // REFRESH PARKING AVAILABILITY
      // ==========================================

      getParking();

      // ==========================================
      // REFRESH SLOTS
      // ==========================================

      if (parkingId) {
        getSlots(parkingId);
      }

      // ==========================================
      // CLEAR NAVIGATION STATE
      // ==========================================

      navigate("/parking", {
        replace: true,
        state: null
      });
    }
  }, [location.state, navigate]);

  // ==========================================
  // LOAD PARKING
  // ==========================================

  const getParking = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8080/api/parking"
      );

      setParking(response.data);
    } catch (error) {
      console.log("Parking Error:", error);

      showAlert(
        "Unable to Load Parking!\n\nFailed to load parking locations. Please try again."
      );
    }
  };

  // ==========================================
  // SHOW MESSAGE
  // ==========================================

  const showSuccess = (text) => {
    setMessageType("success");
    setMessage(text);
  };

  const showError = (text) => {
    setMessageType("error");
    setMessage(text);
  };

  // ==========================================
  // SHOW BROWSER ALERT
  // ==========================================

  const showAlert = (text) => {
    alert(text);
  };

  // ==========================================
  // LOAD SLOTS
  // ==========================================

  const getSlots = async (parkingId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/slots/parking/${parkingId}`
      );

      // ==========================================
      // SORT SLOTS NUMERICALLY
      // A1, A2, A3 ... A10, A11 ... A200
      // ==========================================

      const sortedSlots = [...response.data].sort(
        (a, b) => {
          const numberA = parseInt(
            String(a.slotNumber).replace(/\D/g, ""),
            10
          );

          const numberB = parseInt(
            String(b.slotNumber).replace(/\D/g, ""),
            10
          );

          return numberA - numberB;
        }
      );

      setSlots(sortedSlots);
    } catch (error) {
      console.log("Slots Error:", error);

      showAlert(
        "Unable to Load Slots!\n\nFailed to load parking slots."
      );
    }
  };

  // ==========================================
  // SELECT PARKING
  // ==========================================

  const selectParking = (parkingLocation) => {
    setSelectedParking(parkingLocation);

    setSelectedSlot(null);

    setStartTime("");
    setEndTime("");

    setMessage("");
    setMessageType("");

    setConfirmedBooking(null);

    getSlots(parkingLocation.id);
  };

  // ==========================================
  // SELECT SLOT
  // ==========================================

  const selectSlot = (slot) => {
    if (slot.status !== "AVAILABLE") {
      showAlert(
        "Slot Unavailable!\n\nThis parking slot is already booked."
      );

      return;
    }

    setSelectedSlot(slot);

    setMessage("");
    setMessageType("");
  };

  // ==========================================
  // VALIDATE TIME
  // ==========================================

  const validateTime = (start, end) => {
    if (!start || !end) {
      return true;
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      return false;
    }

    if (
      endDate.getTime() <= startDate.getTime()
    ) {
      return false;
    }

    return true;
  };

  // ==========================================
  // START TIME CHANGE
  // ==========================================

  const handleStartTimeChange = (e) => {
    const value = e.target.value;

    setStartTime(value);

    if (!value || !endTime) {
      setMessage("");
      setMessageType("");
      return;
    }

    if (!validateTime(value, endTime)) {
      showAlert(
        "Invalid Booking Time!\n\nEnd time must be after start time."
      );

      setEndTime("");

      setMessage("");
      setMessageType("");

      return;
    }

    setMessage("");
    setMessageType("");
  };

  // ==========================================
  // END TIME CHANGE
  // ==========================================

  const handleEndTimeChange = (e) => {
    const value = e.target.value;

    if (!startTime) {
      showAlert(
        "Start Time Required!\n\nPlease select the start date and time first."
      );

      setEndTime("");

      return;
    }

    if (!validateTime(startTime, value)) {
      showAlert(
        "Invalid Booking Time!\n\nEnd time must be after start time."
      );

      setEndTime("");

      setMessage("");
      setMessageType("");

      return;
    }

    setEndTime(value);

    setMessage("");
    setMessageType("");
  };

  // ==========================================
  // PROCEED TO PAYMENT
  // ==========================================

  const proceedToPayment = () => {
    // ==========================================
    // GET LOGIN DATA
    // ==========================================

    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!savedUser || !token) {
      showAlert(
        "Login Required!\n\nPlease login before booking a parking slot."
      );

      navigate("/login");
      return;
    }

    // ==========================================
    // GET USER
    // ==========================================

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      console.log("User data error:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      showAlert(
        "Invalid Login Session!\n\nPlease login again."
      );

      navigate("/login");
      return;
    }

    // ==========================================
    // USER CHECK
    // ==========================================

    if (!user.userId) {
      showAlert(
        "User Information Missing!\n\nPlease login again."
      );

      return;
    }

    // ==========================================
    // PARKING CHECK
    // ==========================================

    if (!selectedParking) {
      showAlert(
        "Parking Location Required!\n\nPlease select a parking location."
      );

      return;
    }

    // ==========================================
    // SLOT CHECK
    // ==========================================

    if (!selectedSlot) {
      showAlert(
        "Parking Slot Required!\n\nPlease select an available parking slot."
      );

      return;
    }

    // ==========================================
    // START TIME CHECK
    // ==========================================

    if (!startTime) {
      showAlert(
        "Start Time Required!\n\nPlease select the start date and time."
      );

      return;
    }

    // ==========================================
    // END TIME CHECK
    // ==========================================

    if (!endTime) {
      showAlert(
        "End Time Required!\n\nPlease select the end date and time."
      );

      return;
    }

    // ==========================================
    // TIME VALIDATION
    // ==========================================

    if (!validateTime(startTime, endTime)) {
      showAlert(
        "Invalid Booking Time!\n\nEnd time must be after start time."
      );

      return;
    }

    // ==========================================
    // CALCULATE DURATION
    // ==========================================

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    const durationInHours =
      (endDate.getTime() - startDate.getTime()) /
      (1000 * 60 * 60);

    const duration = Math.ceil(durationInHours);

    // ==========================================
    // CALCULATE PAYMENT AMOUNT
    // ==========================================

    const amount =
      duration *
      Number(selectedParking.pricePerHour);

    // ==========================================
    // SEND BOOKING DATA TO PAYMENT PAGE
    // ==========================================

    navigate("/payment", {
      state: {
        userId: user.userId,

        parkingId: selectedParking.id,

        slotId: selectedSlot.id,

        startTime: startTime,

        endTime: endTime,

        parkingName: selectedParking.name,

        slotNumber: selectedSlot.slotNumber,

        pricePerHour:
          selectedParking.pricePerHour,

        duration: duration,

        amount: amount
      }
    });
  };

  // ==========================================
  // OLD BOOK SLOT FUNCTION
  // ==========================================
  // Kept temporarily so existing functionality
  // is not lost.

  const bookSlot = async () => {
    // ==========================================
    // GET LOGIN DATA
    // ==========================================

    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    // ==========================================
    // LOGIN CHECK
    // ==========================================

    if (!savedUser || !token) {
      showAlert(
        "Login Required!\n\nPlease login before booking a parking slot."
      );

      return;
    }

    // ==========================================
    // GET USER
    // ==========================================

    let user;

    try {
      user = JSON.parse(savedUser);
    } catch (error) {
      console.log("User data error:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      showAlert(
        "Invalid Login Session!\n\nPlease login again."
      );

      return;
    }

    // ==========================================
    // USER CHECK
    // ==========================================

    if (!user.userId) {
      showAlert(
        "User Information Missing!\n\nPlease login again."
      );

      return;
    }

    // ==========================================
    // PARKING CHECK
    // ==========================================

    if (!selectedParking) {
      showAlert(
        "Parking Location Required!\n\nPlease select a parking location."
      );

      return;
    }

    // ==========================================
    // SLOT CHECK
    // ==========================================

    if (!selectedSlot) {
      showAlert(
        "Parking Slot Required!\n\nPlease select an available parking slot."
      );

      return;
    }

    // ==========================================
    // START TIME CHECK
    // ==========================================

    if (!startTime) {
      showAlert(
        "Start Time Required!\n\nPlease select the start date and time."
      );

      return;
    }

    // ==========================================
    // END TIME CHECK
    // ==========================================

    if (!endTime) {
      showAlert(
        "End Time Required!\n\nPlease select the end date and time."
      );

      return;
    }

    // ==========================================
    // TIME VALIDATION
    // ==========================================

    if (!validateTime(startTime, endTime)) {
      showAlert(
        "Invalid Booking Time!\n\nEnd time must be after start time."
      );

      return;
    }

    // ==========================================
    // BOOKING REQUEST
    // ==========================================

    try {
      const bookingData = {
        userId: user.userId,
        parkingId: selectedParking.id,
        slotId: selectedSlot.id,
        startTime: startTime,
        endTime: endTime
      };

      console.log(
        "Booking Data:",
        bookingData
      );

      const response = await axios.post(
        "http://localhost:8080/api/bookings",
        bookingData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json"
          }
        }
      );

      console.log(
        "Booking Response:",
        response.data
      );

      // ==========================================
      // BOOKING SUCCESS
      // ==========================================

      const bookingId =
        response.data.id;

      showAlert(
        `Booking Confirmed!\n\nYour Booking ID is #${bookingId}`
      );

      // ==========================================
      // CREATE CONFIRMATION CARD
      // ==========================================

      setConfirmedBooking({
        id: bookingId,

        parkingName:
          selectedParking.name,

        slotNumber:
          selectedSlot.slotNumber,

        startTime:
          startTime,

        endTime:
          endTime
      });

      setMessage("");
      setMessageType("");

      // ==========================================
      // CLEAR FORM
      // ==========================================

      setSelectedSlot(null);
      setStartTime("");
      setEndTime("");

      // ==========================================
      // REFRESH PARKING DATA
      // ==========================================

      await getParking();

      // ==========================================
      // REFRESH SLOTS
      // ==========================================

      await getSlots(
        selectedParking.id
      );

    } catch (error) {
      console.log(
        "Booking Error:",
        error
      );

      // ==========================================
      // BACKEND ERROR
      // ==========================================

      if (error.response) {
        console.log(
          "Status:",
          error.response.status
        );

        console.log(
          "Response:",
          error.response.data
        );

        // ==========================================
        // 401
        // ==========================================

        if (
          error.response.status === 401
        ) {
          showAlert(
            "Session Expired!\n\nPlease login again before booking."
          );

          return;
        }

        // ==========================================
        // 403
        // ==========================================

        if (
          error.response.status === 403
        ) {
          showAlert(
            "Access Denied!\n\nYou are not authorized to create a booking."
          );

          return;
        }

        // ==========================================
        // OTHER BACKEND ERRORS
        // ==========================================

        const backendMessage =
          error.response.data?.message;

        showAlert(
          backendMessage
            ? `Booking Failed!\n\n${backendMessage}`
            : "Booking Failed!\n\nPlease try again."
        );

        return;
      }

      // ==========================================
      // NO BACKEND CONNECTION
      // ==========================================

      showAlert(
        "Connection Error!\n\nUnable to connect to the backend."
      );
    }
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="parking-page">

      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <div className="parking-header">

        <div>

          <span className="parking-page-label">
            SMART PARKING
          </span>

          <h1>
            Find Your Parking Spot
          </h1>

          <p>
            Choose a parking location, select an available
            slot and reserve it for your preferred time.
          </p>

        </div>

        <div className="parking-header-icon">
          🅿️
        </div>

      </div>


      {/* ======================================
          MESSAGE
      ======================================= */}

      {message && (
        <div
          className={
            messageType === "error"
              ? "booking-message error-message"
              : "booking-message success-message"
          }
        >

          <span className="message-icon">
            {messageType === "error"
              ? "⚠️"
              : "✓"}
          </span>

          <span>
            {message}
          </span>

        </div>
      )}


      {/* ======================================
          BOOKING CONFIRMATION
      ======================================= */}

      {confirmedBooking && (
        <section className="booking-confirmation">

          <div className="confirmation-check">
            ✓
          </div>

          <span className="confirmation-label">
            BOOKING SUCCESSFUL
          </span>

          <h2>
            Booking Confirmed
          </h2>

          <p className="confirmation-subtitle">
            Your parking slot has been successfully reserved.
          </p>


          {/* ======================================
              BOOKING ID
          ======================================= */}

          <div className="confirmation-booking-id">

            <span>
              Booking ID
            </span>

            <strong>
              #{confirmedBooking.id}
            </strong>

          </div>


          {/* ======================================
              BOOKING DETAILS
          ======================================= */}

          <div className="confirmation-details">

            {/* PARKING */}

            <div className="confirmation-detail">

              <span className="confirmation-detail-icon">
                🅿️
              </span>

              <div>

                <small>
                  Parking
                </small>

                <strong>
                  {confirmedBooking.parkingName}
                </strong>

              </div>

            </div>


            {/* SLOT */}

            <div className="confirmation-detail">

              <span className="confirmation-detail-icon">
                🚗
              </span>

              <div>

                <small>
                  Parking Slot
                </small>

                <strong>
                  {confirmedBooking.slotNumber}
                </strong>

              </div>

            </div>


            {/* DATE */}

            <div className="confirmation-detail">

              <span className="confirmation-detail-icon">
                📅
              </span>

              <div>

                <small>
                  Date
                </small>

                <strong>
                  {new Date(
                    confirmedBooking.startTime
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    }
                  )}
                </strong>

              </div>

            </div>


            {/* TIME */}

            <div className="confirmation-detail">

              <span className="confirmation-detail-icon">
                🕐
              </span>

              <div>

                <small>
                  Time
                </small>

                <strong>

                  {new Date(
                    confirmedBooking.startTime
                  ).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "numeric",
                      minute: "2-digit"
                    }
                  )}

                  {" - "}

                  {new Date(
                    confirmedBooking.endTime
                  ).toLocaleTimeString(
                    "en-IN",
                    {
                      hour: "numeric",
                      minute: "2-digit"
                    }
                  )}

                </strong>

              </div>

            </div>

          </div>


          {/* ======================================
              PAYMENT DETAILS
          ======================================= */}

          {confirmedBooking.amount && (
            <div className="confirmation-payment">

              <div>
                <span>
                  Amount Paid
                </span>

                <strong>
                  ₹{confirmedBooking.amount}
                </strong>
              </div>

              {confirmedBooking.paymentMethod && (
                <div>
                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {confirmedBooking.paymentMethod}
                  </strong>
                </div>
              )}

            </div>
          )}


          {/* ======================================
              QR CODE
          ======================================= */}

          <div className="booking-qr">

            <div className="qr-header">

              <span className="qr-icon">
                ▣
              </span>

              <div>

                <h3>
                  Your Parking QR Code
                </h3>

                <p>
                  Scan this QR code at the parking entrance.
                </p>

              </div>

            </div>


            <div className="qr-code-container">

              <QRCodeCanvas
                value={JSON.stringify({
                  bookingId:
                    confirmedBooking.id,

                  parking:
                    confirmedBooking.parkingName,

                  slot:
                    confirmedBooking.slotNumber,

                  startTime:
                    confirmedBooking.startTime,

                  endTime:
                    confirmedBooking.endTime
                })}
                size={220}
                level="H"
              />

            </div>


            <p className="qr-booking-id">
              Booking #{confirmedBooking.id}
            </p>

            <p className="qr-instruction">
              Please keep this QR code available when
              entering the parking area.
            </p>

          </div>


          {/* ======================================
              ACTION BUTTONS
          ======================================= */}

          <div className="confirmation-actions">

            <button
              className="view-qr-button"
              onClick={() => {
                const qrSection =
                  document.querySelector(
                    ".booking-qr"
                  );

                if (qrSection) {
                  qrSection.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                  });
                }
              }}
            >
              <span>
                ▣
              </span>

              View QR
            </button>


            <button
              className="my-bookings-button"
              onClick={() =>
                navigate("/my-bookings")
              }
            >
              My Bookings

              <span>
                →
              </span>

            </button>

          </div>


          {/* ======================================
              CONTINUE BROWSING
          ======================================= */}

          <button
            className="close-confirmation"
            onClick={() =>
              setConfirmedBooking(null)
            }
          >
            Continue Browsing
          </button>

        </section>
      )}


      {/* ======================================
          PARKING LOCATIONS
      ======================================= */}

      <section className="parking-section">

        <div className="parking-section-title">

          <div>

            <h2>
              Choose Parking Location
            </h2>

            <p>
              Select a parking area to view available slots.
            </p>

          </div>

          <span className="location-count">
            {parking.length} Locations
          </span>

        </div>


        <div className="parking-list">

          {parking.length === 0 ? (

            <div className="empty-parking">

              <div className="empty-parking-icon">
                🅿️
              </div>

              <h3>
                No Parking Locations Found
              </h3>

              <p>
                Please try again later.
              </p>

            </div>

          ) : (

            parking.map((p) => (

              <div
                className={
                  selectedParking?.id === p.id
                    ? "parking-card selected-parking"
                    : "parking-card"
                }
                key={p.id}
              >

                {/* CARD TOP */}

                <div className="parking-card-top">

                  <div className="parking-card-icon">
                    🅿️
                  </div>

                  {selectedParking?.id === p.id && (
                    <span className="selected-badge">
                      ✓ Selected
                    </span>
                  )}

                </div>


                {/* NAME */}

                <h2>
                  {p.name}
                </h2>


                {/* LOCATION */}

                <p className="parking-location">
                  📍 {p.location}
                </p>


                {/* INFORMATION */}

                <div className="parking-info-grid">

                  <div className="parking-info">

                    <span>
                      Available
                    </span>

                    <strong>
                      {p.availableSlots}
                    </strong>

                  </div>


                  <div className="parking-info">

                    <span>
                      Total Slots
                    </span>

                    <strong>
                      {p.totalSlots}
                    </strong>

                  </div>


                  <div className="parking-info">

                    <span>
                      Price / Hour
                    </span>

                    <strong>
                      ₹{p.pricePerHour}
                    </strong>

                  </div>

                </div>


                {/* SELECT BUTTON */}

                <button
                  className="parking-select-button"
                  onClick={() =>
                    selectParking(p)
                  }
                >
                  {selectedParking?.id === p.id
                    ? "Selected"
                    : "View Slots →"}
                </button>

              </div>

            ))

          )}

        </div>

      </section>


      {/* ======================================
          SELECTED PARKING + SLOTS
      ======================================= */}

      {selectedParking && (

        <section className="slot-section">

          {/* HEADER */}

          <div className="slot-section-header">

            <div>

              <span className="parking-page-label">
                {selectedParking.name}
              </span>

              <h2>
                Choose Your Parking Slot
              </h2>

              <p>
                Select an available slot below.
              </p>

            </div>


            {/* LEGEND */}

            <div className="slot-legend">

              <div>

                <span className="legend-dot available-dot">
                </span>

                Available

              </div>


              <div>

                <span className="legend-dot booked-dot">
                </span>

                Booked

              </div>


              <div>

                <span className="legend-dot selected-dot">
                </span>

                Selected

              </div>

            </div>

          </div>


          {/* SLOTS */}

          <div className="slots-container">

            {slots.length === 0 ? (

              <div className="empty-slots">

                <div>
                  🚗
                </div>

                <p>
                  No parking slots available.
                </p>

              </div>

            ) : (

              slots.map((slot) => (

                <button
                  key={slot.id}
                  onClick={() =>
                    selectSlot(slot)
                  }
                  disabled={
                    slot.status !== "AVAILABLE"
                  }
                  className={
                    selectedSlot?.id === slot.id
                      ? "slot selected"
                      : slot.status === "AVAILABLE"
                      ? "slot available"
                      : "slot booked"
                  }
                >
                  {slot.slotNumber}
                </button>

              ))

            )}

          </div>


          {/* SELECTED SLOT */}

          {selectedSlot && (

            <div className="selected-slot-info">

              <span className="selected-slot-check">
                ✓
              </span>

              <div>

                <strong>
                  Slot {selectedSlot.slotNumber} selected
                </strong>

                <p>
                  Now choose your parking date and time.
                </p>

              </div>

            </div>

          )}

        </section>

      )}


      {/* ======================================
          BOOKING FORM
      ======================================= */}

      {selectedSlot && (

        <section className="booking-form">

          {/* FORM HEADER */}

          <div className="booking-form-header">

            <div>

              <span className="parking-page-label">
                RESERVE SLOT
              </span>

              <h2>
                Complete Your Booking
              </h2>

              <p>
                {selectedParking.name} · Slot{" "}
                {selectedSlot.slotNumber}
              </p>

            </div>

            <div className="booking-form-icon">
              📅
            </div>

          </div>


          {/* SUMMARY */}

          <div className="booking-summary">

            <div>

              <span>
                Parking
              </span>

              <strong>
                {selectedParking.name}
              </strong>

            </div>


            <div>

              <span>
                Slot
              </span>

              <strong>
                {selectedSlot.slotNumber}
              </strong>

            </div>


            <div>

              <span>
                Price / Hour
              </span>

              <strong>
                ₹{selectedParking.pricePerHour}
              </strong>

            </div>

          </div>


          {/* START TIME */}

          <label htmlFor="startTime">
            Start Date & Time
          </label>

          <input
            id="startTime"
            type="datetime-local"
            value={startTime}
            onChange={handleStartTimeChange}
          />


          {/* END TIME */}

          <label htmlFor="endTime">
            End Date & Time
          </label>

          <input
            id="endTime"
            type="datetime-local"
            value={endTime}
            onChange={handleEndTimeChange}
          />


          {/* CONFIRM BOOKING */}

          <button
            className="confirm-booking-button"
            onClick={proceedToPayment}
          >
            Confirm Booking

            <span>
              →
            </span>

          </button>

        </section>

      )}

    </div>
  );
}