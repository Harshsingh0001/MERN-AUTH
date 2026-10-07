const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoSanitize = require("@exortek/express-mongo-sanitize");
const xssSanitize = require("./middleware/xssSanitize");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./modules/auth/auth.routes");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(mongoSanitize());

app.use(xssSanitize);
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Authentication Backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use(errorHandler);

module.exports = app;