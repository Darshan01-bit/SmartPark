import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">

      {/* =====================================================
          HERO SECTION
          ===================================================== */}

      <section className="hero-section">

        <div className="hero-content">

          <div className="hero-badge">
            🚗 SMART PARKING PLATFORM
          </div>

          <h1>
            Smart Parking
            <span> Made Simple</span>
          </h1>

          <p className="hero-description">
            Find available parking, reserve your slot and use
            AI-powered demand prediction to plan your journey
            smarter.
          </p>

          <div className="hero-buttons">

            <button
              className="hero-primary-button"
              onClick={() => navigate("/parking")}
            >
              Find Parking
              <span>→</span>
            </button>

            <button
              className="hero-secondary-button"
              onClick={() => navigate("/prediction")}
            >
              🤖 AI Prediction
            </button>

          </div>

          {/* Quick stats */}

          <div className="hero-stats">

            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Parking Access</span>
            </div>

            <div className="hero-stat-divider"></div>

            <div className="hero-stat">
              <strong>AI</strong>
              <span>Demand Prediction</span>
            </div>

            <div className="hero-stat-divider"></div>

            <div className="hero-stat">
              <strong>QR</strong>
              <span>Secure Verification</span>
            </div>

          </div>

        </div>

        {/* Hero visual */}

        <div className="hero-visual">

          <div className="parking-illustration">

            <div className="parking-circle">
              🅿️
            </div>

            <div className="floating-card floating-card-one">
              <span className="floating-icon">🟢</span>
              <div>
                <strong>Available</strong>
                <small>Parking Slots</small>
              </div>
            </div>

            <div className="floating-card floating-card-two">
              <span className="floating-icon">🤖</span>
              <div>
                <strong>AI Prediction</strong>
                <small>Smart Demand</small>
              </div>
            </div>

            <div className="parking-car">
              🚗
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FEATURES SECTION
          ===================================================== */}

      <section className="features-section">

        <div className="section-heading">

          <span>SMARTPARK FEATURES</span>

          <h2>
            Everything you need for
            <span> smarter parking</span>
          </h2>

          <p>
            SmartPark combines parking management, online booking
            and artificial intelligence into one platform.
          </p>

        </div>


        <div className="feature-grid">

          {/* Feature 1 */}

          <div className="feature-card">

            <div className="feature-icon blue">
              🅿️
            </div>

            <h3>Easy Parking</h3>

            <p>
              View parking locations and check available slots
              before you arrive.
            </p>

          </div>


          {/* Feature 2 */}

          <div className="feature-card">

            <div className="feature-icon green">
              📅
            </div>

            <h3>Easy Booking</h3>

            <p>
              Select your preferred parking slot and reserve it
              with just a few clicks.
            </p>

          </div>


          {/* Feature 3 */}

          <div className="feature-card">

            <div className="feature-icon purple">
              🤖
            </div>

            <h3>AI Prediction</h3>

            <p>
              Predict future parking demand using machine
              learning and historical booking data.
            </p>

          </div>


          {/* Feature 4 */}

          <div className="feature-card">

            <div className="feature-icon orange">
              📱
            </div>

            <h3>QR Verification</h3>

            <p>
              Generate a booking QR code and verify your parking
              reservation quickly.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          HOW IT WORKS
          ===================================================== */}

      <section className="how-section">

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            Parking in
            <span> 4 simple steps</span>
          </h2>

        </div>


        <div className="steps-container">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              🅿️
            </div>

            <h3>Find Parking</h3>

            <p>
              Choose a parking location that works for you.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              🅿️
            </div>

            <h3>Select Slot</h3>

            <p>
              View available slots and choose your preferred one.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              📅
            </div>

            <h3>Book Slot</h3>

            <p>
              Select your date and time and confirm your booking.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              04
            </div>

            <div className="step-icon">
              📱
            </div>

            <h3>Scan & Park</h3>

            <p>
              Use your QR code for quick booking verification.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          AI SECTION
          ===================================================== */}

      <section className="ai-section">

        <div className="ai-content">

          <div className="ai-label">
            🤖 ARTIFICIAL INTELLIGENCE
          </div>

          <h2>
            Plan your parking
            <span> smarter with AI</span>
          </h2>

          <p>
            SmartPark uses a Random Forest machine learning model
            to analyze historical parking bookings and estimate
            future parking demand.
          </p>

          <button
            className="ai-button"
            onClick={() => navigate("/prediction")}
          >
            Explore AI Prediction →
          </button>

        </div>

        <div className="ai-visual">

          <div className="ai-chart-card">

            <div className="chart-header">
              <span>Parking Demand</span>
              <span className="chart-status">
                ● LIVE MODEL
              </span>
            </div>

            <div className="fake-chart">

              <div className="chart-bar bar-one"></div>
              <div className="chart-bar bar-two"></div>
              <div className="chart-bar bar-three"></div>
              <div className="chart-bar bar-four"></div>
              <div className="chart-bar bar-five"></div>

            </div>

            <div className="chart-footer">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FINAL CTA
          ===================================================== */}

      <section className="cta-section">

        <div>

          <h2>
            Ready to park smarter?
          </h2>

          <p>
            Find your parking spot and make your journey easier.
          </p>

        </div>

        <button
          className="cta-button"
          onClick={() => navigate("/parking")}
        >
          Find Parking →
        </button>

      </section>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="home-footer">

        <div className="footer-brand">
          🅿️ SmartPark
        </div>

        <p>
          Smart Parking Management & AI-Based Demand Prediction
        </p>

        <span>
          © 2026 SmartPark. All rights reserved.
        </span>

      </footer>

    </div>
  );
}