import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId || "";
  const email = location.state?.email || "";
  const phone = location.state?.phone || "";
  const method = location.state?.method || "email";

  const contact = method === "email" ? email : phone;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!userId || !contact) {
      setError(
        "Reset information is missing. Please start again."
      );
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/reset-password", {
        userId,
        password,
        confirmPassword,
      });

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!userId || !contact) {
    return (
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">A</div>

              <h1>Reset Password</h1>

              <p>
                Your password reset information is
                missing.
              </p>
            </div>

            <Link
              to="/forgot-password"
              className="primary-button"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              Start Again
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">✓</div>

            <h1>Create a new password</h1>

            <p>
              Your identity has been verified. Set a new
              password for your account.
            </p>
          </div>

          <div
            style={{
              padding: "12px 14px",
              border: "1px solid #e5eaf2",
              borderRadius: "10px",
              background: "#f8fafc",
              color: "#475467",
              fontSize: "13px",
              textAlign: "center",
              lineHeight: "1.5",
              marginBottom: "20px",
            }}
          >
            Resetting password for{" "}
            <strong>{contact}</strong>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="reset-password">
                New password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="reset-password"
                  className="form-input"
                  type={
                    showPassword ? "text" : "password"
                  }
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Enter a strong password"
                  autoComplete="new-password"
                  style={{ paddingRight: "80px" }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#4f46e5",
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "6px",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#667085",
                  fontSize: "12px",
                  lineHeight: "1.5",
                }}
              >
                Use at least 8 characters with uppercase,
                lowercase, number and special character.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="reset-confirm-password">
                Confirm new password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="reset-confirm-password"
                  className={`form-input ${
                    confirmPassword &&
                    password !== confirmPassword
                      ? "input-error"
                      : ""
                  }`}
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  style={{ paddingRight: "80px" }}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    border: "none",
                    background: "transparent",
                    color: "#4f46e5",
                    fontSize: "13px",
                    fontWeight: "600",
                    padding: "6px",
                  }}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>

              {confirmPassword &&
                password !== confirmPassword && (
                  <p className="field-error">
                    Passwords do not match.
                  </p>
                )}
            </div>

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

            {success && (
              <p className="success-message">
                {success}
              </p>
            )}

            <button
              type="submit"
              className="primary-button"
              disabled={loading}
            >
              {loading
                ? "Resetting password..."
                : "Reset Password"}
            </button>
          </form>

          <div className="auth-footer">
            <Link
              to="/login"
              className="auth-link"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
