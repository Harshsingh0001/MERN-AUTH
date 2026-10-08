const bcrypt = require("bcrypt");

const Session = require("./session.model");

const createSession = async ({
  userId,
  refreshToken,
  jti,
  expiresAt,
  userAgent,
  ipAddress,
}) => {
  const refreshTokenHash = await bcrypt.hash(
    refreshToken,
    12
  );

  const session = await Session.create({
    user: userId,
    refreshTokenHash,
    jti,
    expiresAt,
    userAgent: userAgent || null,
    ipAddress: ipAddress || null,
  });

  return session;
};

const verifySessionRefreshToken = async (
  session,
  refreshToken
) => {
  if (!session || session.isRevoked) {
    return false;
  }

  if (new Date() > session.expiresAt) {
    return false;
  }

  return bcrypt.compare(
    refreshToken,
    session.refreshTokenHash
  );
};

const revokeSession = async (session) => {
  session.isRevoked = true;
  session.revokedAt = new Date();

  await session.save();
};

const revokeAllUserSessions = async (userId) => {
  await Session.updateMany(
    {
      user: userId,
      isRevoked: false,
    },
    {
      $set: {
        isRevoked: true,
        revokedAt: new Date(),
      },
    }
  );
};

const getUserSessions = async (userId) => {
  return Session.find({ user: userId })
    .sort({ createdAt: -1 })
    .select("-refreshTokenHash");
};

module.exports = {
  createSession,
  verifySessionRefreshToken,
  revokeSession,
  revokeAllUserSessions,
  getUserSessions,
};