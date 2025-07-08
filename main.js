const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

// Connexion DB
mongoose.connect(process.env.MONGO_URI_2)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch((err) => console.error('❌ Erreur de connexion à MongoDB :', err));

// Importation des routes
const authRoutes = require("./routes/authRoutes");
const employeRoutes = require("./routes/employeRoutes");
const pointageRoutes = require("./routes/pointageRoutes");
const equipeRoutes = require("./routes/equipeRoutes");
const planningRoutes = require("./routes/planningRoutes");
const affectationRoutes = require("./routes/affectationRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(express.json());
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type"],
}));

// Routes publiques
app.use("/api/auth", authRoutes);

// Routes protégées (middleware de vérification mis directement dans chaque route de chaque fichier, pas besoin ici)
app.use("/api/employes", employeRoutes);
app.use("/api/pointages", pointageRoutes);
app.use("/api/equipes", equipeRoutes);
app.use("/api/plannings", planningRoutes);
app.use("/api/affectations", affectationRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Route de base (optionnelle)
app.get("/", (req, res) => {
  res.send("API de gestion de pointage opérationnelle !");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
});