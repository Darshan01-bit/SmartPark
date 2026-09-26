import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import jsQR from "jsqr";
import API from "../services/api.js";

export default function QRScanner() {
  const [result, setResult] = useState("");
  const [booking, setBooking] = useState(null);
  const [message, setMessage] = useState("");
  const [scanning, setScanning] = useState(true);
  const [loading, setLoading] = useState(false);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // --------------------------------
  // CAMERA QR SCANNER
  // --------------------------------

  useEffect(() => {
    if (!scanning) {
      return;
    }

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      {
        fps: 10,
        qrbox: {
          width: 250,
          height: 250,
        },
      },
      false
    );

    scannerRef.current = scanner;

    const onScanSuccess = (decodedText) => {
      console.log("Camera QR Data:", decodedText);

      setResult(decodedText);
      setScanning(false);

      try {
        scanner.clear();
      } catch (error) {
        console.log("Scanner clear:", error);
      }

      verifyQR(decodedText);
    };

    const onScanFailure = () => {
      // Ignore continuous scanning errors
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      try {
        scanner.clear();
      } catch (error) {
        console.log("Scanner cleanup:", error);
      }

      scannerRef.current = null;
    };
  }, [scanning]);

  // --------------------------------
  // VERIFY QR WITH BACKEND
  // --------------------------------

  const verifyQR = async (decodedText) => {
    try {
      setLoading(true);
      setMessage("");
      setBooking(null);

      // --------------------------------
      // READ QR JSON
      // --------------------------------

      let qrData;

      try {
        qrData = JSON.parse(decodedText);
      } catch (error) {
        setMessage(
          "Invalid QR code format. Please scan a valid SmartPark QR code."
        );
        return;
      }

      console.log("Decoded QR:", qrData);

      // --------------------------------
      // GET BOOKING ID
      // --------------------------------

      const bookingId = qrData?.bookingId;

      if (!bookingId) {
        setMessage(
          "Invalid QR code. Booking ID not found."
        );
        return;
      }

      console.log(
        "Verifying Booking ID:",
        bookingId
      );

      // --------------------------------
      // GET LOGGED-IN USER
      // --------------------------------

      const savedUser = localStorage.getItem("user");

      if (!savedUser) {
        setMessage(
          "Admin login session not found. Please login again."
        );
        return;
      }

      let user;

      try {
        user = JSON.parse(savedUser);
      } catch (error) {
        setMessage(
          "Invalid login session. Please login again."
        );
        return;
      }

      // --------------------------------
      // GET JWT TOKEN
      // --------------------------------

      const token = user?.token;

      if (!token) {
        setMessage(
          "Authentication token not found. Please login again."
        );
        return;
      }

      console.log("JWT token found.");

      // --------------------------------
      // CHECK ADMIN ROLE
      // --------------------------------

      if (user?.role !== "ADMIN") {
        setMessage(
          "Access denied. Only ADMIN users can verify bookings."
        );
        return;
      }

      console.log("ADMIN user verified.");

      // --------------------------------
      // SEND REQUEST TO SPRING BOOT
      // --------------------------------

      const response = await API.get(
        `/bookings/verify/${bookingId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(
        "Backend Verification:",
        response.data
      );

      setBooking(response.data);
      setMessage("");

    } catch (error) {
      console.error(
        "Verification Error:",
        error
      );

      // --------------------------------
      // BACKEND ERROR
      // --------------------------------

      if (error.response) {
        console.log(
          "Status:",
          error.response.status
        );

        console.log(
          "Response:",
          error.response.data
        );

        // 401
        if (error.response.status === 401) {
          setBooking(null);
          setMessage(
            "Session expired or authentication failed. Please login again."
          );
          return;
        }

        // 403
        if (error.response.status === 403) {
          setBooking(null);
          setMessage(
            "Access denied. Only ADMIN users can verify bookings."
          );
          return;
        }

        // 404
        if (error.response.status === 404) {
          setBooking({
            valid: false,
            message: "Booking not found.",
          });

          setMessage("");
          return;
        }

        // Other backend errors
        if (error.response.data) {
          setBooking(error.response.data);
          setMessage("");
          return;
        }

        setMessage(
          "Unable to verify booking."
        );

        return;
      }

      // --------------------------------
      // NETWORK ERROR
      // --------------------------------

      // NETWORK ERROR

      console.error("Network Error:", error);
      console.error("Error Message:", error.message);
      console.error("Request URL:", error.config?.url);
      console.error("Base URL:", error.config?.baseURL);

      setBooking(null);

      setMessage(
        `Unable to connect to the SmartPark backend. ${error.message}`
      );

    } finally {
      setLoading(false);
    }
  };

  // --------------------------------
  // UPLOAD QR IMAGE
  // --------------------------------

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setMessage("");
    setBooking(null);
    setResult("");
    setLoading(false);
    setScanning(false);

    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas =
          document.createElement("canvas");

        const context =
          canvas.getContext("2d");

        canvas.width = img.width;
        canvas.height = img.height;

        context.drawImage(
          img,
          0,
          0,
          img.width,
          img.height
        );

        const imageData =
          context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

        const code = jsQR(
          imageData.data,
          imageData.width,
          imageData.height
        );

        if (code) {
          console.log(
            "Uploaded QR Data:",
            code.data
          );

          setResult(code.data);

          verifyQR(code.data);

        } else {
          setMessage(
            "QR code could not be detected. Please upload a clear QR screenshot."
          );
        }
      };

      img.onerror = () => {
        setMessage(
          "Unable to read the uploaded image."
        );
      };

      img.src = e.target.result;
    };

    reader.onerror = () => {
      setMessage(
        "Unable to read the selected file."
      );
    };

    reader.readAsDataURL(file);

    // Allow the same file to be selected again
    event.target.value = "";
  };

  // --------------------------------
  // START SCANNING AGAIN
  // --------------------------------

  const startScanning = () => {
    setResult("");
    setBooking(null);
    setMessage("");
    setLoading(false);
    setScanning(true);
  };

  // --------------------------------
  // FORMAT DATE & TIME
  // --------------------------------

  const formatDateTime = (dateTime) => {
    if (!dateTime) {
      return "-";
    }

    try {
      return new Date(dateTime).toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return dateTime;
    }
  };

  // --------------------------------
  // UI
  // --------------------------------

  return (
    <div className="qr-admin-page">

      {/* ============================== */}
      {/* HEADER */}
      {/* ============================== */}

      <section className="qr-admin-header">

        <div>

          <span className="qr-admin-label">
            SMARTPARK ADMIN
          </span>

          <h1>
            QR Verification
          </h1>

          <p>
            Scan a customer's SmartPark booking
            QR code to verify their booking
            before entry.
          </p>

        </div>

        <div className="qr-admin-header-icon">
          📷
        </div>

      </section>


      {/* ============================== */}
      {/* MAIN GRID */}
      {/* ============================== */}

      <div className="qr-admin-grid">

        {/* ============================== */}
        {/* SCANNER */}
        {/* ============================== */}

        <section className="qr-scanner-card">

          <div className="qr-card-header">

            <div>

              <span>
                SCAN BOOKING
              </span>

              <h2>
                QR Code Scanner
              </h2>

            </div>

            <div className="qr-live-badge">

              <span></span>

              {scanning
                ? "Scanner Active"
                : "Scanner Ready"}

            </div>

          </div>


          {/* CAMERA AREA */}

          <div className="qr-reader-wrapper">

            {scanning ? (

              <div
                id="qr-reader"
                className="smartpark-qr-reader"
              ></div>

            ) : (

              <div className="qr-reader-placeholder">

                <div className="qr-placeholder-icon">
                  📷
                </div>

                <h3>
                  Scanner Ready
                </h3>

                <p>
                  Click "Scan Another QR" to
                  start the camera again.
                </p>

              </div>

            )}

          </div>


          {/* ACTION BUTTONS */}

          <div className="qr-scanner-actions">

            {!scanning && (

              <button
                className="start-scanner-button"
                onClick={startScanning}
              >
                📷 Start Camera
              </button>

            )}

            <button
              className="upload-qr-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              🖼 Upload QR Image
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              hidden
              onChange={handleImageUpload}
            />

          </div>


          {/* INSTRUCTIONS */}

          <div className="scanner-instructions">

            <div>
              <span>1</span>
              Start scanner
            </div>

            <div>
              <span>2</span>
              Point camera at QR
            </div>

            <div>
              <span>3</span>
              Verify booking
            </div>

          </div>

        </section>


        {/* ============================== */}
        {/* VERIFICATION RESULT */}
        {/* ============================== */}

        <section className="qr-result-card">

          <div className="qr-card-header">

            <div>

              <span>
                VERIFICATION
              </span>

              <h2>
                Booking Status
              </h2>

            </div>

          </div>


          {/* LOADING */}

          {loading && (

            <div className="qr-verification-loading">

              <div className="qr-spinner"></div>

              <h3>
                Verifying Booking
              </h3>

              <p>
                Checking booking details...
              </p>

            </div>

          )}


          {/* BOOKING RESULT */}

          {!loading && booking && (

            <div
              className={
                booking.valid
                  ? "qr-result success"
                  : "qr-result failure"
              }
            >

              {/* ========================== */}
              {/* VALID BOOKING */}
              {/* ========================== */}

              {booking.valid ? (

                <>

                  <div className="qr-result-icon">
                    ✓
                  </div>

                  <h3>
                    Booking Verified
                  </h3>

                  <p className="qr-result-message">
                    This booking has been successfully
                    verified by SmartPark.
                  </p>


                  <div className="verified-booking-details">

                    <div>
                      <span>
                        Booking ID
                      </span>

                      <strong>
                        #
                        {booking.bookingId ||
                          booking.id ||
                          "-"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Status
                      </span>

                      <strong>
                        {booking.status ||
                          "CONFIRMED"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Parking
                      </span>

                      <strong>
                        {booking.parkingName ||
                          "-"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Location
                      </span>

                      <strong>
                        {booking.parkingLocation ||
                          "-"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Slot
                      </span>

                      <strong>
                        {booking.slotNumber ||
                          "-"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Start Time
                      </span>

                      <strong>
                        {formatDateTime(
                          booking.startTime
                        )}
                      </strong>
                    </div>


                    <div>
                      <span>
                        End Time
                      </span>

                      <strong>
                        {formatDateTime(
                          booking.endTime
                        )}
                      </strong>
                    </div>

                  </div>


                  <div className="entry-approved">

                    <span>
                      ✓
                    </span>

                    Entry Approved

                  </div>

                </>

              ) : (

                /* ========================== */
                /* INVALID BOOKING */
                /* ========================== */

                <>

                  <div className="qr-result-icon">
                    ✕
                  </div>

                  <h3>
                    Booking Not Valid
                  </h3>

                  <p className="qr-result-message">
                    {booking.message ||
                      "This booking cannot be verified."}
                  </p>


                  <div className="verified-booking-details">

                    {booking.bookingId && (

                      <div>

                        <span>
                          Booking ID
                        </span>

                        <strong>
                          #{booking.bookingId}
                        </strong>

                      </div>

                    )}


                    {booking.status && (

                      <div>

                        <span>
                          Status
                        </span>

                        <strong>
                          {booking.status}
                        </strong>

                      </div>

                    )}


                    {booking.startTime && (

                      <div>

                        <span>
                          Start Time
                        </span>

                        <strong>
                          {formatDateTime(
                            booking.startTime
                          )}
                        </strong>

                      </div>

                    )}


                    {booking.endTime && (

                      <div>

                        <span>
                          End Time
                        </span>

                        <strong>
                          {formatDateTime(
                            booking.endTime
                          )}
                        </strong>

                      </div>

                    )}

                  </div>

                </>

              )}


              {/* SCAN AGAIN */}

              <button
                className="scan-again-button"
                onClick={startScanning}
              >
                Scan Another QR
              </button>

            </div>

          )}


          {/* ============================== */}
          {/* EMPTY STATE */}
          {/* ============================== */}

          {!loading &&
            !booking &&
            !message && (

              <div className="qr-result-empty">

                <div className="qr-empty-icon">
                  ✓
                </div>

                <h3>
                  No Booking Scanned
                </h3>

                <p>
                  Scan a SmartPark QR code to
                  view booking verification
                  details.
                </p>

              </div>

            )}


          {/* ============================== */}
          {/* ERROR */}
          {/* ============================== */}

          {!loading && message && (

            <div className="qr-scanner-error">

              <div className="qr-error-icon">
                ⚠
              </div>

              <div>

                <strong>
                  Verification Failed
                </strong>

                <p>
                  {message}
                </p>

              </div>

            </div>

          )}


          {/* ERROR ACTION */}

          {!loading && message && (

            <button
              className="scan-again-button"
              onClick={startScanning}
            >
              Try Another QR
            </button>

          )}

        </section>

      </div>


      {/* ============================== */}
      {/* SECURITY SECTION */}
      {/* ============================== */}

      <section className="qr-security-section">

        <div className="qr-security-icon">
          🔐
        </div>

        <div>

          <span>
            SECURE VERIFICATION
          </span>

          <h2>
            Admin-only booking verification
          </h2>

          <p>
            SmartPark verifies each booking
            through the secured Spring Boot
            backend before allowing entry.
            Only authorized administrators
            can perform QR verification.
          </p>

        </div>

      </section>

    </div>
  );
}