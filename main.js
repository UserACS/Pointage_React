// main.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

// Connexion DB
const connectDB = require("./config/database");
connectDB();

// Importation des routes
const authRoutes = require("./routes/authRoutes");
const pointageRoutes = require("./routes/pointageRoutes");
 // assure-toi que ce fichier contient les bonnes routes
const employeRoutes = require('./routes/employeRoutes');


// Middleware d'auth
const { verifyToken, isAdmin } = require("./middleware/authMiddleware");

const app = express();
app.use(express.json());

// Routes publiques
app.use("/api/auth", authRoutes);

// Routes protégées
app.use("/api/admin/employes", verifyToken, isAdmin, employeRoutes);
app.use("/api/admin/pointages", verifyToken, isAdmin, pointageRoutes);
app.use("/api/pointages", verifyToken, pointageRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});
