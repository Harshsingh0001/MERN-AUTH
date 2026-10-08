const express = require("express");

const {
  getSessions,
  logoutSession,
  logoutAllSessions,
} = require("./session.controller");

const { authenticate } = require("../../middleware/auth.middleware");

const router = express.Router();

router.get("/", authenticate, getSessions);

router.delete("/:sessionId", authenticate, logoutSession);

router.delete("/", authenticate, logoutAllSessions);

module.exports = router;