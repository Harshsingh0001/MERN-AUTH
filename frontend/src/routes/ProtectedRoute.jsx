
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import api from "../services/api";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, logout } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    let active = true;

    const checkSession = async () => {
      try {
        await api.get("/sessions");
      } catch (error) {
        if (!active) return;

        if (error.response?.status === 401) {
          logout();
          window.location.replace("/login");
        }
      }
    };

    // Check immediately, then every 10 seconds.
    checkSession();

    const intervalId = setInterval(checkSession, 10000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [isAuthenticated, logout]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
