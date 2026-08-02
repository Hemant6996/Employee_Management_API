const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const validateEmail = (email) => {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
};

const createCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 3600000,
  };
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name: name.trim(), email: normalizedEmail, password });

    const token = generateToken(user._id, user.tokenVersion);

    res
      .cookie("token", token, createCookieOptions())
      .status(201)
      .json({ message: "Registered successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }

};

// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select("+password");
//     if (!user)
//       return res.status(401).json({ message: "Invalid credentials" });

//     const isMatch = await user.comparePassword(password);
//     if (!isMatch)
//       return res.status(401).json({ message: "Invalid credentials" });

//     const token = generateToken(user._id, user.role);

//     res
//       .cookie("token", token, {
//         httpOnly: true,
//         maxAge: 3600000,
//       })
//       .json({ message: "Login successful" });
//   } catch (error) {
//     next(error);
//   }
// };

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password +tokenVersion"
    );
    if (!user)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Persist a version for users created before token-version revocation existed.
    if (!Number.isInteger(user.tokenVersion)) {
      user.tokenVersion = 0;
      await user.save();
    }

    const token = generateToken(user._id, user.tokenVersion);

    res
      .cookie("token", token, createCookieOptions())
      .json({
        message: "Login successful",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // Invalidate the current token and every other active token for this user.
    await User.findByIdAndUpdate(req.user._id, { $inc: { tokenVersion: 1 } });

    res.cookie("token", "", {
      ...createCookieOptions(),
      maxAge: 0,
      expires: new Date(0),
    });
    res.json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
};

exports.getMe = (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
