const {
  sanitizeText,
  normalizeEmail,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
} = require("../utils/validation");

const validateRegisterInput = ({ name, email, phone }) => {
  const errors = {};

  const cleanName = sanitizeText(name);
  const cleanEmail = normalizeEmail(email);
  const cleanPhone = typeof phone === "string" ? phone.trim() : "";

  // Name
  if (!cleanName) {
    errors.name = "Name is required";
  } else if (cleanName.length < 2) {
    errors.name = "Name must be at least 2 characters";
  } else if (cleanName.length > 100) {
    errors.name = "Name cannot exceed 100 characters";
  }

  // Email
  if (!cleanEmail) {
    errors.email = "Email is required";
  } else if (!isValidEmail(cleanEmail)) {
    errors.email = "Please enter a valid email";
  }

  // Phone
  if (!cleanPhone) {
    errors.phone = "Phone number is required";
  } else if (!isValidPhone(cleanPhone)) {
    errors.phone = "Please enter a valid Indian phone number";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
    },
  };
};

const validateSetPasswordInput = ({ password, confirmPassword }) => {
  const errors = {};

  if (!password) {
    errors.password = "Password is required";
  } else if (!isStrongPassword(password)) {
    errors.password =
      "Password must be at least 8 characters and contain uppercase, lowercase, number and special character";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Confirm password is required";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const validateLoginPasswordInput = ({ email, password }) => {
  const errors = {};

  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    errors.email = "Email is required";
  } else if (!isValidEmail(cleanEmail)) {
    errors.email = "Please enter a valid email";
  }

  if (!password) {
    errors.password = "Password is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      email: cleanEmail,
      password,
    },
  };
};

const validateLoginOTPInput = ({ email }) => {
  const errors = {};

  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail) {
    errors.email = "Email is required";
  } else if (!isValidEmail(cleanEmail)) {
    errors.email = "Please enter a valid email";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      email: cleanEmail,
    },
  };
};
const validateVerifyLoginOTPInput = ({ userId, otp }) => {
  const errors = {};

  if (!userId) {
    errors.userId = "User ID is required";
  }

  if (!otp) {
    errors.otp = "OTP is required";
  } else if (!/^\d{6}$/.test(otp)) {
    errors.otp = "OTP must be a 6-digit number";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      userId,
      otp,
    },
  };
};

const validateForgotPasswordInput = ({ email, phone }) => {
  const errors = {};

  const hasEmail = typeof email === "string" && email.trim() !== "";
  const hasPhone = typeof phone === "string" && phone.trim() !== "";

  if (!hasEmail && !hasPhone) {
    errors.email = "Email or phone number is required";
    errors.phone = "Email or phone number is required";
  }

  if (hasEmail && hasPhone) {
    errors.email = "Provide either email or phone number, not both";
    errors.phone = "Provide either email or phone number, not both";
  }

  let cleanEmail = "";
  let cleanPhone = "";

  if (hasEmail) {
    cleanEmail = normalizeEmail(email);

    if (!isValidEmail(cleanEmail)) {
      errors.email = "Please enter a valid email";
    }
  }

  if (hasPhone) {
    cleanPhone = phone.trim();

    if (!isValidPhone(cleanPhone)) {
      errors.phone = "Please enter a valid Indian phone number";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      email: cleanEmail,
      phone: cleanPhone,
    },
  };
};

const validateResendOTPInput = ({ userId, purpose }) => {
  const errors = {};

  if (!userId) {
    errors.userId = "User ID is required";
  }

  const allowedPurposes = [
    "REGISTER",
    "LOGIN",
    "FORGOT_PASSWORD",
  ];

  if (!purpose) {
    errors.purpose = "OTP purpose is required";
  } else if (!allowedPurposes.includes(purpose)) {
    errors.purpose =
      "Purpose must be REGISTER, LOGIN or FORGOT_PASSWORD";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      userId,
      purpose,
    },
  };
};

const validateRefreshTokenInput = ({ refreshToken }) => {
  const errors = {};

  if (!refreshToken) {
    errors.refreshToken = "Refresh token is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      refreshToken,
    },
  };
};

const validateLogoutInput = ({ refreshToken }) => {
  const errors = {};

  if (!refreshToken) {
    errors.refreshToken = "Refresh token is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      refreshToken,
    },
  };
};

module.exports = {
  validateRegisterInput,
  validateSetPasswordInput,
  validateLoginPasswordInput,
  validateVerifyLoginOTPInput,
  validateForgotPasswordInput,
  validateLoginOTPInput,
  validateResendOTPInput,
  validateRefreshTokenInput,
  validateLogoutInput,
};
