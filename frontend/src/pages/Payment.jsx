import React, { useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "./Payment.css";

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const bookingData = location.state;

  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  // ==========================================
  // CHECK BOOKING DATA
  // ==========================================

  if (!bookingData) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <h2>Payment Information Missing</h2>

          <p>
            Please return to the parking page and
            select a parking slot first.
          </p>

          <button onClick={() => navigate("/parking")}>
            Back to Parking
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // SELECT PAYMENT METHOD
  // ==========================================

  const selectPaymentMethod = (method) => {
    console.log("Selected payment method:", method);
    setPaymentMethod(method);
  };

  // ==========================================
  // HANDLE FAKE PAYMENT
  // ==========================================

  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    console.log("Starting payment:", paymentMethod);

    setPaymentStatus("processing");

    // Simulate fake payment processing
    setTimeout(async () => {
      try {
        // ==========================================
        // GET LOGIN TOKEN
        // ==========================================

        const token = localStorage.getItem("token");

        if (!token) {
          alert(
            "Session Expired!\n\nPlease login again."
          );

          navigate("/login");
          return;
        }

        // ==========================================
        // CREATE BOOKING REQUEST
        // ==========================================

        const requestData = {
          userId: bookingData.userId,
          parkingId: bookingData.parkingId,
          slotId: bookingData.slotId,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime
        };

        console.log(
          "Creating booking after payment:",
          requestData
        );

        // ==========================================
        // SEND BOOKING TO SPRING BOOT
        // ==========================================

        const response = await axios.post(
          "http://localhost:8080/api/bookings",
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        console.log(
          "Booking created successfully:",
          response.data
        );

        // ==========================================
        // PAYMENT SUCCESS
        // ==========================================

        setPaymentStatus("success");

        setTimeout(() => {
        alert(
            "Payment Successful! 🎉\n\n" +
            "Your parking booking has been confirmed.\n\n" +
            "Your QR code will now be displayed."
        );

        navigate("/parking", {
            state: {
            paymentSuccess: true,
            booking: response.data,
            paymentMethod: paymentMethod,
            bookingData: bookingData
            }
        });
        }, 1500);

      } catch (error) {
        console.log(
          "Payment / Booking Error:",
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

          // Unauthorized
          if (error.response.status === 401) {
            alert(
              "Session Expired!\n\nPlease login again."
            );

            navigate("/login");
            return;
          }

          // Forbidden
          if (error.response.status === 403) {
            alert(
              "Access Denied!\n\nYou are not authorized to create a booking."
            );

            setPaymentStatus("");
            return;
          }

          // Other backend errors
          const backendMessage =
            error.response.data?.message;

          alert(
            backendMessage
              ? `Booking Failed!\n\n${backendMessage}`
              : "Booking Failed!\n\nPlease try again."
          );

          setPaymentStatus("");
          return;
        }

        // ==========================================
        // CONNECTION ERROR
        // ==========================================

        alert(
          "Connection Error!\n\nUnable to connect to the backend."
        );

        setPaymentStatus("");
      }
    }, 1500);
  };

  // ==========================================
  // PROCESSING SCREEN
  // ==========================================

  if (paymentStatus === "processing") {
    return (
      <div className="payment-page">
        <div className="payment-card">

          <div className="payment-loading">
            ⏳
          </div>

          <h2>
            Processing Payment...
          </h2>

          <p>
            Please wait while your demo payment
            is being processed.
          </p>

          <p>
            Do not close this page.
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // SUCCESS SCREEN
  // ==========================================

  if (paymentStatus === "success") {
    return (
      <div className="payment-page">
        <div className="payment-card success-card">

          <div className="payment-success-icon">
            ✓
          </div>

          <h1>
            Payment Successful
          </h1>

          <p>
            Your payment and parking booking
            have been completed successfully.
          </p>

          <div className="payment-success-details">

            <p>
              <strong>Parking:</strong>{" "}
              {bookingData.parkingName}
            </p>

            <p>
              <strong>Slot:</strong>{" "}
              {bookingData.slotNumber}
            </p>

            <p>
              <strong>Duration:</strong>{" "}
              {bookingData.duration} hour
            </p>

            <p>
              <strong>Amount:</strong>{" "}
              ₹{bookingData.amount}
            </p>

            <p>
              <strong>Payment Method:</strong>{" "}
              {paymentMethod}
            </p>

          </div>

          <p>
            Redirecting to your booking...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN PAYMENT PAGE
  // ==========================================

  return (
    <div className="payment-page">

      <div className="payment-card">

        {/* HEADER */}

        <span className="payment-label">
          SMARTPARK PAYMENT
        </span>

        <h1>
          Complete Payment
        </h1>

        <p>
          Choose a payment method to continue.
        </p>

        {/* ==========================================
            BOOKING SUMMARY
        ========================================== */}

        <div className="payment-summary">

          <div>
            <span>
              Parking
            </span>

            <strong>
              {bookingData.parkingName}
            </strong>
          </div>

          <div>
            <span>
              Slot
            </span>

            <strong>
              {bookingData.slotNumber}
            </strong>
          </div>

          <div>
            <span>
              Duration
            </span>

            <strong>
              {bookingData.duration} hour
            </strong>
          </div>

          <div>
            <span>
              Total Amount
            </span>

            <strong>
              ₹{bookingData.amount}
            </strong>
          </div>

        </div>

        {/* ==========================================
            PAYMENT METHODS
        ========================================== */}

        <h3>
          Select Payment Method
        </h3>

        <div className="payment-methods">

          {/* ========================================
              UPI
          ======================================== */}

          <button
            type="button"
            className={
              paymentMethod === "UPI"
                ? "payment-method selected"
                : "payment-method"
            }
            onClick={() =>
              selectPaymentMethod("UPI")
            }
          >

            <span className="payment-icon">
              📱
            </span>

            <div className="payment-method-info">

              <strong>
                UPI
              </strong>

              <small>
                Google Pay / PhonePe / Paytm
              </small>

            </div>

            {paymentMethod === "UPI" && (
              <span className="selected-check">
                ✓
              </span>
            )}

          </button>

          {/* ========================================
              CARD
          ======================================== */}

          <button
            type="button"
            className={
              paymentMethod === "Card"
                ? "payment-method selected"
                : "payment-method"
            }
            onClick={() =>
              selectPaymentMethod("Card")
            }
          >

            <span className="payment-icon">
              💳
            </span>

            <div className="payment-method-info">

              <strong>
                Card
              </strong>

              <small>
                Credit / Debit Card
              </small>

            </div>

            {paymentMethod === "Card" && (
              <span className="selected-check">
                ✓
              </span>
            )}

          </button>

          {/* ========================================
              CASH
          ======================================== */}

          <button
            type="button"
            className={
              paymentMethod === "Cash"
                ? "payment-method selected"
                : "payment-method"
            }
            onClick={() =>
              selectPaymentMethod("Cash")
            }
          >

            <span className="payment-icon">
              💵
            </span>

            <div className="payment-method-info">

              <strong>
                Cash
              </strong>

              <small>
                Pay at parking counter
              </small>

            </div>

            {paymentMethod === "Cash" && (
              <span className="selected-check">
                ✓
              </span>
            )}

          </button>

        </div>

        {/* ==========================================
            SELECTED METHOD MESSAGE
        ========================================== */}

        {paymentMethod && (
          <div className="selected-payment-message">
            Selected Payment Method:{" "}
            <strong>
              {paymentMethod}
            </strong>
          </div>
        )}

        {/* ==========================================
            PAY BUTTON
        ========================================== */}

        <button
        type="button"
        onClick={handlePayment}
        disabled={!paymentMethod}
        style={{
            width: "100%",
            padding: "15px",
            marginTop: "25px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: paymentMethod
            ? "#2563eb"
            : "#9ca3af",
            color: "white",
            fontSize: "18px",
            fontWeight: "bold",
            cursor: paymentMethod
            ? "pointer"
            : "not-allowed",
            display: "block",
            visibility: "visible",
            opacity: 1
        }}
        >
        {paymentMethod
            ? `Pay ₹${bookingData.amount}`
            : "Select Payment Method"}
        </button>

        {/* ==========================================
            BACK BUTTON
        ========================================== */}

        <button
          type="button"
          className="back-button"
          onClick={() =>
            navigate("/parking")
          }
        >
          ← Back to Parking
        </button>

      </div>

    </div>
  );
}