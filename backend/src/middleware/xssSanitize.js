const xss = require("xss");

const sanitizeValue = (value) => {
  if (typeof value === "string") {
    return xss(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === "object") {
    const sanitized = {};

    for (const key of Object.keys(value)) {
      sanitized[key] = sanitizeValue(value[key]);
    }

    return sanitized;
  }

  return value;
};

const xssSanitize = (req, res, next) => {
  req.body = sanitizeValue(req.body);

  next();
};

module.exports = xssSanitize;