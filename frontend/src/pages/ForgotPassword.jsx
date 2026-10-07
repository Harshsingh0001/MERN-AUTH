import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [value, setValue] = useState("");
  const [method, setMethod] = useState("email");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanValue = value.trim();

    if (!cleanValue) {
      setError(
        method === "email"
          ? "Please enter your email."
          : "Please enter your phone number."
      );
      return;
    }

    try {
      setLoading(true);

      const requestData =
        method === "email"
          ? { email: cleanValue }
          : { phone: cleanValue };

      const response = await api.post(
        "/auth/forgot-password",
        requestData
      );

      setSuccess(response.data.message);

      navigate("/verify-forgot-password-otp", {
        state: {
          userId: response.data.data.userId,
          email: response.data.data.email || "",
          phone: response.data.data.phone || "",
          method,
        },
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (selectedMethod) => {
    setMethod(selectedMethod);
    setValue("");
    setError("");
    setSuccess("");
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">?</div>

            <h1>Forgot password?</h1>

            <p>
              Enter your registered email or phone number
              to receive a verification OTP.
            </p>
          </div>

          <div className="method-selector">
            <button
              type="button"
              className={`method-button ${
                method === "email" ? "active" : ""
              }`}
              onClick={() => handleMethodChange("email")}
              disabled={loading}
            >
              Email
            </button>

            <button
              type="button"
              className={`method-button ${
                method === "phone" ? "active" : ""
              }`}
              onClick={() => handleMethodChange("phone")}
              disabled={loading}
            >
              Phone
            </button>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            style={{ marginTop: "20px" }}
          >
            <div className="form-group">
              <label htmlFor="forgot-value">
                {method === "email"
                  ? "Email address"
                  : "Phone number"}
              </label>

              <input
                id="forgot-value"
                className={`form-input ${
                  error ? "input-error" : ""
                }`}
                type={
                  method === "email"
                    ? "email"
                    : "tel"
                }
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder={
                  method === "email"
                    ? "Enter your registered email"
                    : "Enter your registered phone number"
                }
                autoComplete={
                  method === "email"
                    ? "email"
                    : "tel"
                }
                maxLength={
                  method === "phone" ? 10 : undefined
                }
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
                ? "Sending OTP..."
                : "Send OTP"}
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

export default ForgotPassword;