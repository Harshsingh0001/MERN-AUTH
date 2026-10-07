import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const VerifyForgotPasswordOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId || "";
  const email = location.state?.email || "";
  const phone = location.state?.phone || "";
  const method = location.state?.method || "email";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const contact = method === "email" ? email : phone;

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!userId || !contact) {
      setError(
        "Verification information is missing. Please start again."
      );
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/verify-forgot-password-otp",
        {
          userId,
          otp,
        }
      );

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/reset-password", {
          state: {
            userId,
            email,
            phone,
            method,
          },
        });
      }, 700);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    if (!userId || !contact) {
      setError(
        "Verification information is missing. Please start again."
      );
      return;
    }

    try {
      setResending(true);

      const response = await api.post("/auth/resend-otp", {
        userId,
        purpose: "FORGOT_PASSWORD",
        method,
      });

      setSuccess(response.data.message);
      setOtp("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  if (!userId || !contact) {
    return (
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">A</div>

              <h1>Verify OTP</h1>

              <p>
                Verification information is missing.
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

            <h1>Verify your OTP</h1>

            <p>
              Enter the 6-digit verification code to
              continue resetting your password.
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
            {method === "email" ? (
              <>
                OTP sent to{" "}
                <strong>{contact}</strong>
              </>
            ) : (
              <>
                OTP shown in backend terminal for{" "}
                <strong>{contact}</strong>
              </>
            )}
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="forgot-otp">
                Verification code
              </label>

              <input
                id="forgot-otp"
                className={`form-input otp-input ${
                  error ? "input-error" : ""
                }`}
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(
                    e.target.value.replace(/\D/g, "")
                  );
                  setError("");
                  setSuccess("");
                }}
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
              />
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
                ? "Verifying..."
                : "Verify OTP"}
            </button>
          </form>

          <div
            className="auth-footer"
            style={{ marginTop: "22px" }}
          >
            <p style={{ margin: 0 }}>
              Didn't receive the OTP?
            </p>

            <button
              type="button"
              className="method-button"
              onClick={handleResend}
              disabled={resending}
              style={{
                marginTop: "8px",
                color: "#4f46e5",
                fontWeight: "600",
              }}
            >
              {resending
                ? "Resending..."
                : "Resend OTP"}
            </button>

            <div style={{ marginTop: "18px" }}>
              <Link
                to="/forgot-password"
                className="auth-link"
              >
                ← Change email or phone
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default VerifyForgotPasswordOTP;
