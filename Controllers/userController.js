const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Enregistrer un administrateur
exports.register = async (req, res) => {
  const { nom, email, password, role, phone } = req.body;
  if (!nom || !email || !password || !role || !phone) {
    return res.status(400).json({ message: "Tous les champs sont requis." });
  }
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email déjà utilisé." });
    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = new User({ nom, email, password: hashedPwd, role, phone });
    await newUser.save();
    res.status(201).json({ message: "Utilisateur enregistré avec succès." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "email et password sont requis." });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Utilisateur non trouvé." });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Mot de passe incorrect." });
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token, userId: user._id, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur." });
  }
};