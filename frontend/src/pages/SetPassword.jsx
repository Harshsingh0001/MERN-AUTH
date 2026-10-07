import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

const SetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userId = location.state?.userId;

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!userId) {
      setError(
        "User information is missing. Please register again."
      );
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill both password fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/set-password", {
        userId,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to set password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <main className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">A</div>

              <h1>Set your password</h1>

              <p>
                Your account information is missing.
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
            <div className="auth-logo">✓</div>

            <h1>Create your password</h1>

            <p>
              Your email has been verified. Create a strong
              password to secure your account.
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  className="form-input"
                  type={
                    showPassword ? "text" : "password"
                  }
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div style={{ position: "relative" }}>
                <input
                  id="confirmPassword"
                  className={`form-input ${
                    formData.confirmPassword &&
                    formData.password !==
                      formData.confirmPassword
                      ? "input-error"
                      : ""
                  }`}
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
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

              {formData.confirmPassword &&
                formData.password !==
                  formData.confirmPassword && (
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
                ? "Saving password..."
                : "Set Password"}
            </button>
          </form>

          <div className="auth-footer">
            Your account is almost ready. You'll be
            redirected to login after setting your password.
          </div>
        </div>
      </div>
    </main>
  );
};

export default SetPassword;
