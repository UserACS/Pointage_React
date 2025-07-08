const jwt = require("jsonwebtoken");
// Si tu veux charger l'utilisateur complet, décommente la ligne suivante
// const User = require("../models/user");

// Vérifie que le token est présent et valide, ajoute req.user
const verifyToken = async (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ message: "Accès refusé, token requis." });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Pour charger le user complet (optionnel) :
    // const user = await User.findById(decoded.userId || decoded.id);
    // if (!user) return res.status(401).json({ message: "Utilisateur non trouvé." });
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalide ou expiré." });
  }
};

// Vérifie le rôle administrateur
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "administrateur") return next();
  res.status(403).json({ message: "Accès refusé, administrateur requis." });
};

// Vérifie le rôle employé
const isEmploye = (req, res, next) => {
  if (req.user && req.user.role === "employe") return next();
  res.status(403).json({ message: "Accès réservé aux employés." });
};

// Vérifie le rôle manager
const isManager = (req, res, next) => {
  if (req.user && req.user.role === "manager") return next();
  res.status(403).json({ message: "Accès réservé aux managers." });
};

// Vérifie le rôle responsable
const isResponsable = (req, res, next) => {
  if (req.user && req.user.role === "responsable") return next();
  res.status(403).json({ message: "Accès réservé aux responsables." });
};


// Middleware pour vérifier le rôle
const requireRole = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) return next();
  res.status(403).json({ message: "Accès refusé, rôle insuffisant." });
};


module.exports = { verifyToken, isAdmin, isEmploye, isManager, isResponsable, requireRole };