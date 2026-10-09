
const {
  generateOTP,
  hashOTP,
  verifyOTP,
  getOTPExpiry,
} = require("../../utils/otp");

// Clear OTP data after successful verification, expiry, or attempt exhaustion.
const clearOTP = (user) => {
  user.otpHash = null;
  user.otpExpiresAt = null;
  user.otpPurpose = null;
  user.otpAttempts = 0;
};

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

  // Check purpose without consuming an OTP belonging to another flow
  if (user.otpPurpose !== purpose) {
    return {
      success: false,
      message: "Invalid OTP purpose",
    };
  }

  // Clear expired OTP
  if (new Date() >= new Date(user.otpExpiresAt)) {
    clearOTP(user);
    await user.save();

    return {
      success: false,
      message: "OTP has expired",
    };
  }

  // Enforce maximum attempts
  if (user.otpAttempts >= 5) {
    clearOTP(user);
    await user.save();

    return {
      success: false,
      message: "Maximum OTP attempts exceeded. Please request a new OTP.",
    };
  }

  // Validate OTP input
  if (!/^\d{6}$/.test(String(otp))) {
    return {
      success: false,
      message: "Please provide a valid 6-digit OTP",
    };
  }

  // Compare submitted OTP against its stored hash
  const isValid = await verifyOTP(String(otp), user.otpHash);

  if (!isValid) {
    user.otpAttempts += 1;

    // Clear OTP immediately after the fifth incorrect attempt
    if (user.otpAttempts >= 5) {
      clearOTP(user);
      await user.save();

      return {
        success: false,
        message: "Maximum OTP attempts exceeded. Please request a new OTP.",
      };
    }

    await user.save();

    return {
      success: false,
      message: "Invalid OTP",
    };
  }

  // Consume OTP after successful verification so it cannot be reused
  clearOTP(user);
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
