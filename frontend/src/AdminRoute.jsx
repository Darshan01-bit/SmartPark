import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(savedUser);

    if (user.role !== "ADMIN") {
        return <Navigate to="/" replace />;
    }

    return children;
}