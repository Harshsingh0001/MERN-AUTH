const express = require("express");

const {
  registerLimiter,
  loginLimiter,
  otpRequestLimiter,
  forgotPasswordLimiter,
} = require("../../middleware/rateLimiter");

const {
  register,
  verifyRegistrationOTP,
  setPassword,
  loginWithPassword,
  loginWithOTP,
  loginWithPhoneOTP,
  verifyLoginOTP,
  verifyPhoneLoginOTP,
  forgotPassword,
  verifyForgotPasswordOTP,
  resetPassword,
  resendOTP,
  refreshToken,
  logout,
} = require("./auth.controller");

const router = express.Router();

router.post("/register", registerLimiter, register);
router.post("/verify-otp", verifyRegistrationOTP);
router.post("/set-password", setPassword);
router.post("/login-password", loginLimiter, loginWithPassword);
router.post("/login-otp", loginLimiter, loginWithOTP);
router.post("/login-phone-otp", loginLimiter, loginWithPhoneOTP);

router.post("/verify-phone-login-otp", verifyPhoneLoginOTP);
router.post("/verify-login-otp", verifyLoginOTP);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/verify-forgot-password-otp", verifyForgotPasswordOTP);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", otpRequestLimiter, resendOTP);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);
module.exports = router;