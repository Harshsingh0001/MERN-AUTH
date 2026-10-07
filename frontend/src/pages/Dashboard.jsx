
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/useAuth";

const Dashboard = () => {
  const navigate = useNavigate();
  const { refreshToken, logout } = useAuth();

  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      await api.post("/auth/logout", {
        refreshToken,
      });
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <main className="simple-dashboard">

      {/* NAVBAR */}
      <nav className="simple-navbar">
        <div className="simple-brand">
          <div className="simple-logo">A</div>

          <span>AuthApp</span>
        </div>

        <button
          className="simple-logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </nav>

      {/* HERO */}
      <section className="simple-hero">
        <div className="hero-content">
          <span className="hero-badge">
            Welcome to AuthApp
          </span>

          <h1>
            Simple, secure and
            <br />
            <span>reliable authentication.</span>
          </h1>

          <p>
            Your account is successfully authenticated.
            Explore the features of this authentication
            system.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="simple-features">
        <div className="section-heading">
          <h2>Built for secure authentication</h2>

          <p>
            Everything you need for a modern authentication
            experience.
          </p>
        </div>

        <div className="feature-grid">

          <div className="simple-card">
            <div className="simple-card-icon">
              ✉
            </div>

            <h3>Email Verification</h3>

            <p>
              Verify your account using secure email OTP
              verification.
            </p>
          </div>

          <div className="simple-card">
            <div className="simple-card-icon">
              🔐
            </div>

            <h3>Secure Passwords</h3>

            <p>
              Passwords are protected using secure hashing
              before storage.
            </p>
          </div>

          <div className="simple-card">
            <div className="simple-card-icon">
              🛡
            </div>

            <h3>JWT Authentication</h3>

            <p>
              Secure access and refresh tokens keep your
              sessions protected.
            </p>
          </div>

          <div className="simple-card">
            <div className="simple-card-icon">
              📱
            </div>

            <h3>Session Management</h3>

            <p>
              Manage and securely revoke authenticated
              sessions.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="simple-cta">
        <h2>Your account is ready.</h2>

        <p>
          You have successfully completed the
          authentication process.
        </p>
      </section>

      {/* FOOTER */}
      <footer className="simple-footer">
        <span>© 2026 AuthApp</span>

        <span>Secure Authentication System</span>
      </footer>

    </main>
  );
};

export default Dashboard;