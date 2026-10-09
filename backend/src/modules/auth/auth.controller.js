const User = require("../user/user.model");

const bcrypt = require("bcrypt");

const { sendOTPEmail } = require("../../services/email.service");
const crypto = require("crypto"); 

const {
  validateRegisterInput,
  validateSetPasswordInput,
  validateLoginPasswordInput,
  validateLoginOTPInput,
  validateVerifyLoginOTPInput,
  validateForgotPasswordInput,
  validateResendOTPInput,
  validateRefreshTokenInput,
  validateLogoutInput,
} = require("../../validators/auth.validator");

const {
  createOTP,
  verifyUserOTP,
} = require("../otp/otp.service");

const {
  createSession,
  verifySessionRefreshToken,
  revokeAllUserSessions,
} = require("../session/session.service");

const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../../utils/jwt");

const register = async (req, res) => {
  try {
    // 1. Validate input
    const validation = validateRegisterInput(req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { name, email, phone } = validation.data;

    // 2. Check existing email and phone
    const existingEmail = await User.findOne({ email });
    const existingPhone = await User.findOne({ phone });

    // 3. Email and phone belong to different users
    if (
      existingEmail &&
      existingPhone &&
      existingEmail._id.toString() !== existingPhone._id.toString()
    ) {
      return res.status(409).json({
        success: false,
        message: "Email or phone number is already registered",
      });
    }

    // 4. Get existing user
    const existingUser = existingEmail || existingPhone;

    // 5. Existing user found
    if (existingUser) {
      // 5A. Fully registered account
      if (existingUser.isVerified && existingUser.password) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered. Please login.",
        });
      }

      // 5B. OTP verified but password is not set
      if (existingUser.isVerified && !existingUser.password) {
        return res.status(200).json({
          success: true,
          message: "Account verified. Please set your password.",
          data: {
            userId: existingUser._id,
            email: existingUser.email,
            phone: existingUser.phone,
            nextStep: "SET_PASSWORD",
          },
        });
      }

      // 5C. Account is not verified
      if (!existingUser.isVerified) {
        // Make sure the same email and phone are being used
        if (
          existingUser.email !== email ||
          existingUser.phone !== phone
        ) {
          return res.status(409).json({
            success: false,
            message:
              "An unverified account already exists with this email or phone number. Please use the same details to continue registration.",
          });
        }

        // Generate a fresh registration OTP
        const otpData = await createOTP(existingUser, "REGISTER");

        await sendOTPEmail(
          existingUser.email,
          otpData.otp
        );

        return res.status(200).json({
          success: true,
          message: "Registration OTP generated again.",
          data: {
            userId: existingUser._id,
            email: existingUser.email,
            phone: existingUser.phone,
            expiresAt: otpData.expiresAt,
            nextStep: "VERIFY_OTP",
          },
        });
      }
    }

    // 6. Create new user
    const user = await User.create({
      name,
      email,
      phone,
    });

    // 7. Generate registration OTP
    const otpData = await createOTP(user, "REGISTER");

    // 8. Send OTP
    await sendOTPEmail(
      user.email,
      otpData.otp
    );

    // 9. Registration response
    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP generated.",
      data: {
        userId: user._id,
        email: user.email,
        phone: user.phone,
        expiresAt: otpData.expiresAt,
        nextStep: "VERIFY_OTP",
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during registration",
    });
  }
};

const verifyRegistrationOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    const result = await verifyUserOTP(
      user,
      otp,
      "REGISTER"
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    user.isVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Registration OTP verified successfully",
      data: {
        userId: user._id,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying OTP",
    });
  }
};

const setPassword = async (req, res) => {
  try {
    const { userId, password, confirmPassword } = req.body;

    // 1. Validate password
    const validation = validateSetPasswordInput({
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    // 2. Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check OTP verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your registration OTP first",
      });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Save password
    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password set successfully",
      data: {
        userId: user._id,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Set password error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while setting password",
    });
  }
};

const loginWithPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    const validation = validateLoginPasswordInput({
      email,
      password,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { email: cleanEmail } = validation.data;

    // 2. Find user
    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // . Check account lock
if (user.lockUntil && new Date() < user.lockUntil) {
  return res.status(429).json({
    success: false,
    message: "Account is temporarily locked. Please try again later.",
  });
}

// Lock period complete ho gaya
if (user.lockUntil && new Date() >= user.lockUntil) {
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();
}
    
    // 3. Check account verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    // 4. Check if password exists
    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Password is not set for this account",
      });
    }

    // 5. Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
  user.failedLoginAttempts += 1;

  if (user.failedLoginAttempts >= 5) {
    user.lockUntil = new Date(
      Date.now() + 15 * 60 * 1000
    );
  }

  await user.save();

  if (user.failedLoginAttempts >= 5) {
    return res.status(429).json({
      success: false,
      message: "Account locked for 15 minutes due to multiple failed login attempts.",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid email or password",
  });
}
  // reset failed login attempts and lockuntil on successful login

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    
    // 6. Generate tokens with a unique session ID
    const jti = crypto.randomUUID();

    const accessToken = generateAccessToken(
      user._id.toString(),
      jti
    );

    const refreshToken = generateRefreshToken(
      user._id.toString(),
      jti
    );

    const decodedRefreshToken = verifyRefreshToken(refreshToken);

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );


await createSession({
  userId: user._id,
  refreshToken,
  jti: decodedRefreshToken.jti,
  expiresAt,
  userAgent: req.get("user-agent"),
  ipAddress: req.ip,
});

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during login",
    });
  }
};

const loginWithOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const validation = validateLoginOTPInput({
      email,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { email: cleanEmail } = validation.data;

    const user = await User.findOne({
      email: cleanEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    const otpData = await createOTP(user, "LOGIN");
    await sendOTPEmail(
      user.email,
      otpData.otp
    );

    return res.status(200).json({
      success: true,
      message: "Login OTP generated successfully",
      data: {
        userId: user._id,
        email: user.email,
        expiresAt: otpData.expiresAt,
      },
    });
  } catch (error) {
    console.error("Login OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating login OTP",
    });
  }
};

const loginWithPhoneOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({
      phone,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    const otpData = await createOTP(user, "LOGIN");

    console.log("=================================");
    console.log(`Phone OTP for ${user.phone}: ${otpData.otp}`);
    console.log("=================================");

    return res.status(200).json({
      success: true,
      message: "Phone login OTP generated successfully",
      data: {
        userId: user._id,
        phone: user.phone,
        expiresAt: otpData.expiresAt,
      },
    });
  } catch (error) {
    console.error("Phone Login OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while generating phone OTP",
    });
  }
};


const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Validate email and OTP
    if (
      !email ||
      typeof email !== "string" ||
      !otp ||
      !/^\d{6}$/.test(String(otp))
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid email and 6-digit OTP are required",
      });
    }

    // 2. Find user
    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check account verification
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    // 4. Verify OTP before generating tokens
    const result = await verifyUserOTP(
      user,
      String(otp),
      "LOGIN"
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    // 5. Generate tokens with the same session ID
    const jti = crypto.randomUUID();

    const accessToken = generateAccessToken(
      user._id.toString(),
      jti
    );

    const refreshToken = generateRefreshToken(
      user._id.toString(),
      jti
    );

    // 6. Create session
    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await createSession({
      userId: user._id,
      refreshToken,
      jti,
      expiresAt,
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });

    // 7. Return success
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Verify login OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying login OTP",
    });
  }
};


const verifyPhoneLoginOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const validation = validateVerifyLoginOTPInput({
      userId,
      otp,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    const result = await verifyUserOTP(
      user,
      otp,
      "LOGIN"
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    
    const jti = crypto.randomUUID();

    const accessToken = generateAccessToken(
      user._id.toString(),
      jti
    );

    const refreshToken = generateRefreshToken(
      user._id.toString(),
      jti
    );

    const expiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await createSession({
      userId: user._id,
      refreshToken,
      jti,
      expiresAt,
      userAgent: req.get("user-agent"),
      ipAddress: req.ip,
    });


    return res.status(200).json({
      success: true,
      message: "Phone login successful",
      data: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Verify phone login OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying phone login OTP",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email, phone } = req.body;

    const validation = validateForgotPasswordInput({
      email,
      phone,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { email: cleanEmail, phone: cleanPhone } = validation.data;

    const user = await User.findOne(
      cleanEmail
        ? { email: cleanEmail }
        : { phone: cleanPhone }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    const otpData = await createOTP(
      user,
      "FORGOT_PASSWORD"
    );

    if (cleanEmail) {
      await sendOTPEmail(
        user.email,
        otpData.otp
      );

      return res.status(200).json({
        success: true,
        message: "Password reset OTP sent successfully to your email",
        data: {
          userId: user._id,
          email: user.email,
          expiresAt: otpData.expiresAt,
        },
      });
    }

    console.log("\n=================================");
    console.log("PASSWORD RESET OTP");
    console.log("Phone:", user.phone);
    console.log("OTP:", otpData.otp);
    console.log("Expires At:", otpData.expiresAt);
    console.log("=================================\n");

    return res.status(200).json({
      success: true,
      message: "Password reset OTP generated successfully",
      data: {
        userId: user._id,
        phone: user.phone,
        expiresAt: otpData.expiresAt,
      },
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while processing forgot password",
    });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { userId, purpose, method } = req.body;

    const validation = validateResendOTPInput({
      userId,
      purpose,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (purpose === "REGISTER" && user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User is already verified",
      });
    }

    if (purpose !== "REGISTER" && !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    if (user.lastOtpSentAt) {
      const secondsSinceLastOTP =
        (Date.now() - user.lastOtpSentAt.getTime()) / 1000;

      if (secondsSinceLastOTP < 60) {
        return res.status(429).json({
          success: false,
          message:
            "Please wait 60 seconds before requesting another OTP",
        });
      }
    }

    const otpData = await createOTP(user, purpose);

    if (method === "phone") {
      console.log("\n=================================");
      console.log("RESEND OTP");
      console.log("Purpose:", purpose);
      console.log("Phone:", user.phone);
      console.log("OTP:", otpData.otp);
      console.log("Expires At:", otpData.expiresAt);
      console.log("=================================\n");

      return res.status(200).json({
        success: true,
        message: "OTP resent successfully to your phone",
        data: {
          userId: user._id,
          phone: user.phone,
          purpose,
          expiresAt: otpData.expiresAt,
        },
      });
    }

    await sendOTPEmail(user.email, otpData.otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully to your email",
      data: {
        userId: user._id,
        email: user.email,
        purpose,
        expiresAt: otpData.expiresAt,
      },
    });
  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while resending OTP",
    });
  }
};

const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "User ID and OTP are required",
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: "OTP must be a 6-digit number",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    const result = await verifyUserOTP(
      user,
      otp,
      "FORGOT_PASSWORD"
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
      });
    }

    user.passwordResetVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset OTP verified successfully",
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    console.error("Verify forgot password OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while verifying password reset OTP",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, password, confirmPassword } = req.body;

    const validation = validateSetPasswordInput({
      password,
      confirmPassword,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your account first",
      });
    }

    if (!user.passwordResetVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify password reset OTP first",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;

    user.passwordResetVerified = false;

    await user.save();

    await revokeAllUserSessions(user._id);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting password",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    const validation = validateRefreshTokenInput({
      refreshToken: token,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { refreshToken } = validation.data;

    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const userId = decoded.userId;
    const jti = decoded.jti;

    const session = await require("../session/session.model").findOne({
      user: userId,
      jti,
      isRevoked: false,
    });

    const isValidSession = await verifySessionRefreshToken(
      session,
      refreshToken
    );

    if (!isValidSession) {
      return res.status(401).json({
        success: false,
        message: "Session is invalid or revoked",
      });
    }

    const newAccessToken = generateAccessToken(userId, jti);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed successfully",
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while refreshing token",
    });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    const validation = validateLogoutInput({
      refreshToken: token,
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.errors,
      });
    }

    const { refreshToken } = validation.data;

    let decoded;

    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const userId = decoded.userId;
    const jti = decoded.jti;

    const session = await require("../session/session.model").findOne({
      user: userId,
      jti,
      isRevoked: false,
    });

    const isValidSession = await verifySessionRefreshToken(
      session,
      refreshToken
    );

    if (!isValidSession) {
      return res.status(401).json({
        success: false,
        message: "Session is invalid or already logged out",
      });
    }

    await require("../session/session.service").revokeSession(
      session
    );

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong during logout",
    });
  }
};

module.exports = {
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
};