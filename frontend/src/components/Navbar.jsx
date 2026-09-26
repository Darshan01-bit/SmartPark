import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {

  const navigate = useNavigate();

  const [user, setUser] = useState(() => {

    const savedUser =
      localStorage.getItem("user");

    return savedUser
      ? JSON.parse(savedUser)
      : null;
  });

  const isAdmin =
    user?.role === "ADMIN";

  const logout = () => {

    // Remove authentication data
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Update navbar immediately
    setUser(null);

    // Go to login page
    navigate("/login");
  };

  return (
    <nav className="navbar">

      {/* Logo */}
      <Link
        to="/"
        className="navbar-brand"
      >
        <span className="brand-icon">
          🅿️
        </span>

        <span>
          Smart<span>Park</span>
        </span>
      </Link>


      {/* Navigation */}
      <div className="nav-links">

        <Link
          to="/"
          className="nav-link"
        >
          Home
        </Link>

        <Link
          to="/parking"
          className="nav-link"
        >
          Parking
        </Link>

        {user && (
          <>
            <Link
              to="/my-bookings"
              className="nav-link"
            >
              My Bookings
            </Link>

            <Link
              to="/dashboard"
              className="nav-link"
            >
              Dashboard
            </Link>

            <Link
              to="/prediction"
              className="nav-link"
            >
              AI Prediction
            </Link>
          </>
        )}


        {/* Admin only */}
        {isAdmin && (
          <>
            <Link
              to="/qr-scanner"
              className="nav-link admin-link"
            >
              QR Scanner
            </Link>

            <Link
              to="/finished-bookings"
              className="nav-link admin-link"
            >
              Finished Bookings
            </Link>
          </>
        )}


        {/* Logged OUT */}
        {!user ? (
          <>
            <Link
              to="/login"
              className="nav-login"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="nav-register"
            >
              Register
            </Link>
          </>
        ) : (

          /* Logged IN */
          <div className="nav-user-section">

            <div className="nav-user">
              <span className="user-icon">
                👤
              </span>

              <div className="user-info">

                <strong>
                  {user.name}
                </strong>

                <small>
                  {user.role}
                </small>

              </div>
            </div>

            <button
              className="nav-logout"
              onClick={logout}
            >
              Logout
            </button>

          </div>
        )}

      </div>

    </nav>
  );
}