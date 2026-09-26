import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {

  const savedUser = localStorage.getItem("user");

  if (!savedUser) {
    return <Navigate to="/login" replace />;
  }

  let user;

  try {
    user = JSON.parse(savedUser);
  } catch (error) {
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  const isStaff =
    user.role === "ADMIN" ||
    user.role === "STAFF";

  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  return children;
}