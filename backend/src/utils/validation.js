const validator = require("validator");

// Sanitize normal text input
const sanitizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return validator.escape(value.trim());
};

// Normalize email
const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    return "";
  }

  return validator.normalizeEmail(email.trim()) || "";
};

// Validate email
const isValidEmail = (email) => {
  return typeof email === "string" && validator.isEmail(email.trim());
};

// Validate Indian phone number
const isValidPhone = (phone) => {
  if (typeof phone !== "string") {
    return false;
  }

  return validator.isMobilePhone(phone.trim(), "en-IN");
};

// Validate strong password
const isStrongPassword = (password) => {
  if (typeof password !== "string") {
    return false;
  }

  return validator.isStrongPassword(password, {
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  });
};

module.exports = {
  sanitizeText,
  normalizeEmail,
  isValidEmail,
  isValidPhone,
  isStrongPassword,
};