import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!userId) {
      setError("User information is missing. Please register again.");
      return;
    }

    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/verify-otp", {
        userId,
        otp,
      });

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/set-password", {
          state: { userId },
        });
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "OTP verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccess("");

    if (!userId) {
      setError("User information is missing. Please register again.");
      return;
    }

    try {
      setResendLoading(true);

      const response = await api.post("/auth/resend-otp", {
        userId,
        purpose: "REGISTER",
      });

      setSuccess(response.data.message);
      setTimer(60);
      setOtp("");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to resend OTP. Please try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (!userId) {
    return (
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">A</div>

              <h1>Verify OTP</h1>

              <p>
                Your verification information is missing.
              </p>
            </div>

            <button
              type="button"
              className="primary-button"
              onClick={() => navigate("/register")}
            >
              Back to Registration
            </button>
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
            <div className="auth-logo">✉</div>

            <h1>Verify your email</h1>

            <p>
              Enter the 6-digit OTP sent to your email
              address.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="otp">
                Verification code
              </label>

              <input
                id="otp"
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

          <div className="auth-footer">
            <p>
              Didn't receive the OTP?
            </p>

            {timer > 0 ? (
              <p style={{ marginTop: "8px" }}>
                You can resend it in{" "}
                <strong>{timer}s</strong>
              </p>
            ) : (
              <button
                type="button"
                className="method-button"
                onClick={handleResendOTP}
                disabled={resendLoading}
                style={{
                  marginTop: "8px",
                  color: "#4f46e5",
                }}
              >
                {resendLoading
                  ? "Resending..."
                  : "Resend OTP"}
              </button>
            )}
          </div>

        </div>
      </div>
    </main>
  );
};

export default VerifyOTP;