// middleware/verifyAdmin.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyAdmin = async (req, res, next) => {
  const token = req.header('Authorization')?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé, token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user && user.role === 'administrateur') {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ message: 'Accès réservé aux administrateurs.' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

module.exports = verifyAdmin;
