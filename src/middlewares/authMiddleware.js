const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    const user = await User.findById(decoded.id).select("+tokenVersion");

    if (
      !user ||
      !Number.isInteger(decoded.tokenVersion) ||
      decoded.tokenVersion !== user.tokenVersion
    ) {
      return res.status(401).json({ message: "Token invalid" });
    }

    // Authorize against the current database role, never a role stored in the JWT.
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: "Token invalid" });
  }
};
