import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loginUser = async (e) => {

    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {

      const response = await API.post(
        "/users/login",
        {
          email: email,
          password: password
        }
      );

      const user = response.data;

      // Save complete user information
      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      // Save JWT token
      localStorage.setItem(
        "token",
        user.token
      );

      setMessage("Login successful!");

      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
        window.location.reload();
      }, 500);

    } catch (error) {

      setError(
        error.response?.data?.message ||
        "Invalid email or password"
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div className="auth-logo">
          🅿️
        </div>

        <h1>Welcome Back</h1>

        <p className="auth-subtitle">
          Login to your SmartPark account
        </p>

        <form onSubmit={loginUser}>

          <label>Email Address</label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        {message && (
          <div className="auth-success">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="auth-error">
            ⚠️ {error}
          </div>
        )}

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create Account
          </Link>
        </p>

      </div>

    </div>
  );
}