// controllers/userController.js

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Inscription d'un administrateur ou d'un employé
exports.register = async (req, res) => {
  const { nom, email, password, role } = req.body;

  // Vérifier les champs requis
  if (!nom || !email || !password || !role) {
    return res.status(400).json({ message: "nom, email, password et role sont requis." });
  }

  // Si on veut restreindre l'inscription à admin, déplacer la logique dans le routeur ou middleware
  try {
    const hashedPwd = bcrypt.hashSync(password, 10);
    const newUser = new User({ nom, email, password: hashedPwd, role });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur enregistré avec succès." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Connexion (login)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email et password sont requis." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Utilisateur non trouvé." });
    }

    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Mot de passe incorrect." });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};
