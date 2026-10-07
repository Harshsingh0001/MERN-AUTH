import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove the error as soon as the user starts correcting the field
    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFieldErrors({
      name: "",
      email: "",
      phone: "",
    });

    setSuccess("");

    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Full name is required.";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", formData);

      setSuccess(response.data.message);

      const nextStep = response.data.data.nextStep;

      if (nextStep === "SET_PASSWORD") {
        navigate("/set-password", {
          state: {
            userId: response.data.data.userId,
          },
        });

        return;
      }

      navigate("/verify-otp", {
        state: {
          userId: response.data.data.userId,
        },
      });
    } catch (error) {
      const backendErrors = error.response?.data?.errors;

      if (backendErrors) {
        setFieldErrors({
          name: backendErrors.name || "",
          email: backendErrors.email || "",
          phone: backendErrors.phone || "",
        });
      } else {
        setFieldErrors({
          name: "",
          email: "",
          phone:
            error.response?.data?.message ||
            "Registration failed. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">A</div>

            <h1>Create your account</h1>

            <p>
              Register to get started with your account
            </p>
          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
          >
            {/* NAME */}
            <div className="form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                className={`form-input ${
                  fieldErrors.name ? "input-error" : ""
                }`}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />

              {fieldErrors.name && (
                <p className="field-error">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="email">
                Email address
              </label>

              <input
                id="email"
                className={`form-input ${
                  fieldErrors.email ? "input-error" : ""
                }`}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                autoComplete="email"
              />

              {fieldErrors.email && (
                <p className="field-error">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* PHONE */}
            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                className={`form-input ${
                  fieldErrors.phone ? "input-error" : ""
                }`}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your 10-digit phone number"
                autoComplete="tel"
                maxLength={10}
              />

              {fieldErrors.phone && (
                <p className="field-error">
                  {fieldErrors.phone}
                </p>
              )}
            </div>

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
                ? "Creating account..."
                : "Create account"}
            </button>
          </form>

          <div className="auth-footer">
            <span>
              Already have an account?{" "}
            </span>

            <Link
              to="/login"
              className="auth-link"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;