
const Session = require("../modules/session/session.model");
const { verifyAccessToken } = require("../utils/jwt");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = verifyAccessToken(token);

    const session = await Session.findOne({
      jti: decoded.jti,
      user: decoded.userId,
      isRevoked: false,
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session has been revoked or is no longer active",
      });
    }

    if (new Date() > session.expiresAt) {
      return res.status(401).json({
        success: false,
        message: "Session has expired",
      });
    }

    req.user = {
      id: decoded.userId,
      jti: decoded.jti,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired access token",
    });
  }
};

module.exports = {
  authenticate,
};
