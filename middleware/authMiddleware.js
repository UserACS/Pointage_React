// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({ message: "Accès refusé, token requis." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token invalide ou expiré." });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "administrateur") {
    return next();
  }
  return res.status(403).json({ message: "Accès refusé, l'utilisateur doit être administrateur." });
};

module.exports = { verifyToken, isAdmin };
