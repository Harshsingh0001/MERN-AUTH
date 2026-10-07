

const {
  generateOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiry,
} = require("../../utils/otp");

// Create and store a new OTP
const createOTP = async (user, purpose) => {
  const otp = generateOTP();

  const otpHash = await hashOTP(otp);
  const otpExpiresAt = getOTPExpiry();

  user.otpHash = otpHash;
  user.otpExpiresAt = otpExpiresAt;
  user.otpPurpose = purpose;
  user.otpAttempts = 0;
  user.lastOtpSentAt = new Date();

  await user.save();

  return {
    otp,
    expiresAt: otpExpiresAt,
  };
};

// Verify an OTP
const verifyUserOTP = async (user, otp, purpose) => {
  // Check whether OTP exists
  if (!user.otpHash || !user.otpExpiresAt) {
    return {
      success: false,
      message: "OTP not found or expired",
    };
  }

  // Check purpose
  if (user.otpPurpose !== purpose) {
    return {
      success: false,
      message: "Invalid OTP purpose",
    };
  }

  // Check expiry
  if (new Date() > user.otpExpiresAt) {
    return {
      success: false,
      message: "OTP has expired",
    };
  }

  // Maximum 5 attempts
  if (user.otpAttempts >= 5) {
    return {
      success: false,
      message: "Maximum OTP attempts exceeded",
    };
  }

  // Increase attempt count
  user.otpAttempts += 1;

  const isValid = await verifyOTP(otp, user.otpHash);

  if (!isValid) {
    await user.save();

    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  // OTP successfully verified
  user.otpHash = null;
  user.otpExpiresAt = null;
  user.otpPurpose = null;
  user.otpAttempts = 0;

  await user.save();

  return {
    success: true,
    message: "OTP verified successfully",
  };
};

module.exports = {
  createOTP,
  verifyUserOTP,
};