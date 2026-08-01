const jwt = require("jsonwebtoken");

const generateToken = (id, tokenVersion) => {
  return jwt.sign(
    { id, tokenVersion },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

module.exports = generateToken;
