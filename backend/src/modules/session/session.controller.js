const Session = require("./session.model");
const { getUserSessions, revokeSession } = require("./session.service");

// Get all sessions of logged-in user
const getSessions = async (req, res, next) => {
  try {
    const sessions = await getUserSessions(req.user.id);

    res.status(200).json({
      success: true,
      message: "Sessions fetched successfully",
      data: sessions,
    });
  } catch (error) {
    next(error);
  }
};

// Revoke one session
const logoutSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({
      _id: req.params.sessionId,
      user: req.user.id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.isRevoked) {
      return res.status(400).json({
        success: false,
        message: "Session already revoked",
      });
    }

    await revokeSession(session);

    res.status(200).json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Revoke all sessions
const logoutAllSessions = async (req, res, next) => {
  try {
    await Session.updateMany(
      {
        user: req.user.id,
        isRevoked: false,
      },
      {
        $set: {
          isRevoked: true,
          revokedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "All sessions revoked successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSessions,
  logoutSession,
  logoutAllSessions,
};