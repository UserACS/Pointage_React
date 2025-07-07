// routes/authRoutes.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

// Middleware debug
router.use((req, res, next) => {
  console.log("🔥 /auth BODY:", req.body);
  next();
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { nom, email, password, role } = req.body;

  if (!nom || !email || !password || !role) {
    return res.status(400).json({ message: "nom, email, password et role sont requis." });
  }

  if (role.toLowerCase() !== "administrateur") {
    return res.status(400).json({
      message: "Seul un utilisateur avec le rôle 'administrateur' peut s'inscrire en tant qu'administrateur."
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    const hashedPwd = await bcrypt.hash(password, 10);
    const newUser = new User({ nom, email, password: hashedPwd, role: "administrateur" });
    await newUser.save();

    return res.status(201).json({ message: "Administrateur enregistré avec succès." });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
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

    return res.json({ token });
  }catch (err) {
    console.error("Erreur dans /login :", err); // Ajoute ceci
    return res.status(500).json({ message: "Erreur serveur." });
  }
  
});
console.log("JWT_SECRET:", process.env.JWT_SECRET);


module.exports = router;
