const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Utility to validate tokens
const validateToken = async (token) => {
  if (!token) throw new Error("No token provided");

  const decoded = jwt.verify(token, process.env.SECRET_KEY);
  const user = await User.findById(decoded.userId);

  if (!user) throw new Error("User not found");
  return { decoded, user };
};

// Admin Middleware
const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    const { user } = await validateToken(token);

    if (user.role.toLowerCase() !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    req.user = user; // Attach user to request
    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error.message);
    res.status(400).json({ message: error.message });
  }
};



module.exports = { verifyAdmin };


