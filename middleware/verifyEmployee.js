// middleware/verifyEmployee.js

const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyEmployee = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'Accès refusé, token manquant.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (user && user.role === 'employe') {
      req.user = user;
      next();
    } else {
      return res.status(403).json({ message: 'Accès réservé aux employés.' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Token invalide.' });
  }
};

module.exports = verifyEmployee;
