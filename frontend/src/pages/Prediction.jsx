import React, { useState } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Prediction() {
  const [formData, setFormData] = useState({
    location: "Parking A",
    parking_id: "1",
    date: "",
    time: "",
    holiday: "0",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [chartData, setChartData] = useState([]);

  // -----------------------------------------
  // Parking location mapping
  // -----------------------------------------

  const locationToId = {
    "Parking A": "1",
    "Parking B": "4",
    "Parking C": "5",
  };

  // -----------------------------------------
  // Parking names
  // -----------------------------------------

  const parkingNames = {
    "Parking A": "City Mall Parking",
    "Parking B": "Phoenix Mall Parking",
    "Parking C": "Thane Station Parking",
  };

  // -----------------------------------------
  // Handle input changes
  // -----------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------------------
  // Handle parking location
  // -----------------------------------------

  const handleLocationChange = (e) => {
    const selectedLocation = e.target.value;

    setFormData((prev) => ({
      ...prev,
      location: selectedLocation,
      parking_id:
        locationToId[selectedLocation] || "1",
    }));
  };

  // -----------------------------------------
  // Get occupancy class
  // -----------------------------------------

  const getLevelClass = (level) => {
    if (!level) return "";

    return level.toLowerCase();
  };

  // -----------------------------------------
  // Get level icon
  // -----------------------------------------

  const getLevelIcon = (level) => {
    if (level === "HIGH") return "🔴";
    if (level === "MEDIUM") return "🟠";
    if (level === "LOW") return "🟢";

    return "●";
  };

  // -----------------------------------------
  // Format hour
  // -----------------------------------------

  const formatHour = (hour) => {
    return String(hour).padStart(2, "0") + ":00";
  };

  // -----------------------------------------
  // Get prediction + 5-hour forecast
  // -----------------------------------------

  const getPrediction = async () => {
    setLoading(true);
    setError("");
    setPrediction(null);
    setChartData([]);

    try {
      // -----------------------------------------
      // Check date
      // -----------------------------------------

      if (!formData.date) {
        setError("Please select a date.");
        setLoading(false);
        return;
      }

      // -----------------------------------------
      // Check time
      // -----------------------------------------

      if (!formData.time) {
        setError("Please select a time.");
        setLoading(false);
        return;
      }

      // -----------------------------------------
      // Create JavaScript Date
      // -----------------------------------------

      const selectedDate = new Date(
        `${formData.date}T${formData.time}`
      );

      // -----------------------------------------
      // Check valid date
      // -----------------------------------------

      if (isNaN(selectedDate.getTime())) {
        setError(
          "Please enter a valid date and time."
        );

        setLoading(false);
        return;
      }

      // -----------------------------------------
      // Convert JavaScript day to Python day
      //
      // JavaScript:
      // Sunday = 0
      // Monday = 1
      // ...
      // Saturday = 6
      //
      // Python:
      // Monday = 0
      // ...
      // Sunday = 6
      // -----------------------------------------

      const javascriptDay =
        selectedDate.getDay();

      const dayOfWeek =
        javascriptDay === 0
          ? 6
          : javascriptDay - 1;

      // -----------------------------------------
      // Extract selected hour
      // -----------------------------------------

      const selectedHour = parseInt(
        formData.time.split(":")[0],
        10
      );

      // -----------------------------------------
      // Parking ID
      // -----------------------------------------

      const parkingId = parseInt(
        formData.parking_id,
        10
      );

      // -----------------------------------------
      // Holiday
      // -----------------------------------------

      const isHoliday = parseInt(
        formData.holiday,
        10
      );

      // -----------------------------------------
      // 1. CURRENT PREDICTION
      // -----------------------------------------

      const predictionParams = new URLSearchParams({
        parking_id: parkingId.toString(),
        day_of_week: dayOfWeek.toString(),
        hour: selectedHour.toString(),
        is_holiday: isHoliday.toString(),
      });

      const predictionUrl =
        `http://127.0.0.1:8000/predict?${predictionParams.toString()}`;

      console.log(
        "Sending prediction request:",
        predictionUrl
      );

      const response = await fetch(
        predictionUrl
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "FastAPI Error:",
          response.status,
          errorText
        );

        throw new Error(
          `FastAPI returned status ${response.status}`
        );
      }

      const data = await response.json();

      console.log(
        "Prediction response:",
        data
      );

      // -----------------------------------------
      // Save current prediction
      // -----------------------------------------

      setPrediction({
        location: formData.location,
        parkingName:
          data.parking_name ||
          parkingNames[formData.location],
        date: formData.date,
        time: formData.time,

        predicted_demand:
          data.predicted_demand,

        occupancy_level:
          data.occupancy_level,

        occupancy_percentage:
          data.occupancy_percentage,

        capacity:
          data.capacity,
      });

      // -----------------------------------------
      // 2. GET 5-HOUR FORECAST
      // -----------------------------------------

      const forecastParams =
        new URLSearchParams({
          parking_id: parkingId.toString(),
          day_of_week: dayOfWeek.toString(),
          start_hour: selectedHour.toString(),
          is_holiday: isHoliday.toString(),
        });

      const forecastUrl =
        `http://127.0.0.1:8000/forecast?${forecastParams.toString()}`;

      console.log(
        "Sending forecast request:",
        forecastUrl
      );

      const forecastResponse =
        await fetch(forecastUrl);

      if (!forecastResponse.ok) {
        const errorText =
          await forecastResponse.text();

        console.error(
          "Forecast Error:",
          forecastResponse.status,
          errorText
        );

        throw new Error(
          `Forecast request failed with status ${forecastResponse.status}`
        );
      }

      const forecastData =
        await forecastResponse.json();

      console.log(
        "5-hour forecast response:",
        forecastData
      );

      // -----------------------------------------
      // Convert forecast data for Recharts
      // -----------------------------------------

      const forecastResults =
        forecastData.forecast.map(
          (item) => ({
            hour: formatHour(item.hour),

            hourNumber: item.hour,

            demand: Number(
              item.predicted_demand
            ),

            level:
              item.occupancy_level,

            occupancyPercentage:
              Number(
                item.occupancy_percentage
              ),
          })
        );

      console.log(
        "Chart data:",
        forecastResults
      );

      setChartData(
        forecastResults
      );

    } catch (err) {
      console.error("Prediction Error:", err);

      setError(
        err.message ||
        "Unable to connect to FastAPI."
      );
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div className="prediction-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <section className="prediction-header">

        <div className="prediction-header-content">

          <span className="prediction-label">
            SMARTPARK AI
          </span>

          <h1>
            Parking Demand Prediction
          </h1>

          <p>
            Use AI-powered analysis to predict
            parking demand and understand expected
            occupancy for the next few hours.
          </p>

        </div>

        <div className="prediction-header-icon">
          🤖
        </div>

      </section>


      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="prediction-main-grid">

        {/* =================================
            PREDICTION FORM
        ================================= */}

        <section className="prediction-form-card">

          <div className="prediction-card-heading">

            <div>

              <span>
                AI PREDICTION
              </span>

              <h2>
                Prediction Settings
              </h2>

            </div>

            <div className="ai-status-badge">
              <span></span>
              AI Ready
            </div>

          </div>


          <div className="prediction-form">

            {/* Parking Location */}

            <div className="prediction-field">

              <label>
                Parking Location
              </label>

              <select
                name="location"
                value={formData.location}
                onChange={
                  handleLocationChange
                }
              >

                <option value="Parking A">
                  City Mall Parking
                </option>

                <option value="Parking B">
                  Phoenix Mall Parking
                </option>

                <option value="Parking C">
                  Thane Station Parking
                </option>

              </select>

            </div>


            {/* Date */}

            <div className="prediction-field">

              <label>
                Date
              </label>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />

            </div>


            {/* Time */}

            <div className="prediction-field">

              <label>
                Time
              </label>

              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />

            </div>


            {/* Holiday */}

            <div className="prediction-field">

              <label>
                Day Type
              </label>

              <select
                name="holiday"
                value={formData.holiday}
                onChange={handleChange}
              >

                <option value="0">
                  Regular Day
                </option>

                <option value="1">
                  Holiday
                </option>

              </select>

            </div>


            {/* Predict Button */}

            <button
              type="button"
              className="prediction-button"
              onClick={getPrediction}
              disabled={loading}
            >

              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Analyzing Parking Data...
                </>
              ) : (
                <>
                  🤖 Predict Parking Demand
                </>
              )}

            </button>

          </div>

        </section>


        {/* =================================
            PREDICTION RESULT
        ================================= */}

        <section className="prediction-result-card">

          <div className="prediction-card-heading">

            <div>

              <span>
                PREDICTION RESULT
              </span>

              <h2>
                Expected Demand
              </h2>

            </div>

          </div>


          {/* Empty State */}

          {!prediction &&
            !loading && (

              <div className="prediction-empty">

                <div className="prediction-empty-icon">
                  🤖
                </div>

                <h3>
                  Ready for Prediction
                </h3>

                <p>
                  Select a parking location,
                  date and time, then generate
                  an AI prediction.
                </p>

              </div>
            )}


          {/* Loading */}

          {loading && (

            <div className="prediction-loading">

              <div className="prediction-spinner"></div>

              <h3>
                AI is analyzing...
              </h3>

              <p>
                Generating parking demand
                prediction and forecast.
              </p>

            </div>
          )}


          {/* Result */}

          {prediction &&
            !loading && (

              <div className="prediction-result">

                {/* Demand */}

                <div className="demand-number">

                  <span>
                    Predicted Parking Demand
                  </span>

                  <strong>
                    {Number(
                      prediction.predicted_demand
                    ).toFixed(2)}
                  </strong>

                  <small>
                    expected vehicles
                  </small>

                </div>


                {/* Occupancy */}

                <div
                  className={`demand-status ${getLevelClass(
                    prediction.occupancy_level
                  )}`}
                >

                  <span className="status-dot"></span>

                  {getLevelIcon(
                    prediction.occupancy_level
                  )}

                  {prediction.occupancy_level}

                </div>


                {/* Details */}

                <div className="prediction-details">

                  <div>

                    <span>
                      Parking
                    </span>

                    <strong>
                      {prediction.parkingName}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Capacity
                    </span>

                    <strong>
                      {prediction.capacity} slots
                    </strong>

                  </div>


                  <div>

                    <span>
                      Occupancy
                    </span>

                    <strong>
                      {Number(
                        prediction.occupancy_percentage
                      ).toFixed(2)}
                      %
                    </strong>

                  </div>


                  <div>

                    <span>
                      Date
                    </span>

                    <strong>
                      {prediction.date}
                    </strong>

                  </div>


                  <div>

                    <span>
                      Time
                    </span>

                    <strong>
                      {prediction.time}
                    </strong>

                  </div>

                </div>

              </div>
            )}

        </section>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (

        <div className="prediction-error">

          <span className="error-icon">
            ⚠️
          </span>

          <div>

            <strong>
              Prediction Error
            </strong>

            <p>
              {error}
            </p>

          </div>

        </div>
      )}


      {/* =====================================
          FORECAST
      ===================================== */}

      {chartData.length > 0 && (

        <section className="forecast-section">

          {/* Forecast Header */}

          <div className="forecast-header">

            <div>

              <span>
                AI FORECAST
              </span>

              <h2>
                5-Hour Parking Demand Forecast
              </h2>

              <p>
                Expected demand for{" "}
                <strong>
                  {prediction?.parkingName}
                </strong>
              </p>

            </div>

            <div className="forecast-badge">
              📈 Next 5 Hours
            </div>

          </div>


          {/* =================================
              GRAPH
          ================================= */}

          <div className="forecast-chart-card">

            <div className="chart-top-bar">

              <div>

                <h3>
                  Demand Trend
                </h3>

                <p>
                  Predicted vehicles by hour
                </p>

              </div>

              <div className="chart-ai-badge">
                🤖 AI Forecast
              </div>

            </div>


            <div className="forecast-chart">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={chartData}
                  margin={{
                    top: 20,
                    right: 20,
                    left: 0,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                  />

                  <XAxis
                    dataKey="hour"
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    tick={{
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "10px",
                      border:
                        "1px solid #e5e7eb",
                      boxShadow:
                        "0 8px 25px rgba(15, 23, 42, 0.10)",
                    }}
                    formatter={(value, name, props) => {

                      if (name === "Demand") {
                        return [
                          `${Number(
                            value
                          ).toFixed(2)} vehicles`,
                          "Demand",
                        ];
                      }

                      return [value, name];
                    }}
                    labelFormatter={(label) =>
                      `Time: ${label}`
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="demand"
                    name="Demand"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{
                      r: 6,
                      fill: "#2563eb",
                      strokeWidth: 2,
                      stroke: "#ffffff",
                    }}
                    activeDot={{
                      r: 8,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* =================================
              FORECAST CARDS
          ================================= */}

          <div className="forecast-cards">

            {chartData.map(
              (item, index) => (

                <div
                  key={index}
                  className="forecast-card"
                >

                  <span className="forecast-time">
                    {item.hour}
                  </span>

                  <strong>
                    {Number(
                      item.demand
                    ).toFixed(2)}
                  </strong>

                  <span className="forecast-vehicles">
                    vehicles
                  </span>

                  <span
                    className={`forecast-level ${getLevelClass(
                      item.level
                    )}`}
                  >

                    <span className="forecast-dot"></span>

                    {item.level}

                  </span>

                  <span className="forecast-occupancy">
                    {Number(
                      item.occupancyPercentage
                    ).toFixed(1)}
                    % occupied
                  </span>

                </div>
              )
            )}

          </div>

        </section>
      )}

    </div>
  );
}