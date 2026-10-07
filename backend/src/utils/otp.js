const crypto = require("crypto");
const bcrypt = require("bcrypt");

const OTP_EXPIRY_MINUTES = 5;
const OTP_LENGTH = 6;
const BCRYPT_ROUNDS = 12;

// Generate secure 6-digit OTP
const generateOTP = () => {
  const min = 100000;
  const max = 999999;

  return crypto.randomInt(min, max + 1).toString();
};

// Hash OTP before storing in database
const hashOTP = async (otp) => {
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
};

// Compare entered OTP with stored hash
const verifyOTP = async (otp, otpHash) => {
  return bcrypt.compare(otp, otpHash);
};

// Calculate OTP expiry time
const getOTPExpiry = () => {
  return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiry,
};