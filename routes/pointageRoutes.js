const express = require("express");
const router = express.Router();
const pointageController = require("../controllers/pointageController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Pointer (tous)
router.post("/", verifyToken, requireRole("employe", "responsable", "manager", "administrateur"), pointageController.enregistrerPointage);
// Voir ses pointages (employé connecté)
router.get("/moi", verifyToken, requireRole("employe", "responsable", "manager"), pointageController.listerMesPointages);
// Voir les pointages d’un employé (admin, responsable, manager)
router.get("/:employeId", verifyToken, requireRole("administrateur", "responsable", "manager"), pointageController.listerPointages);
// Temps de travail
router.get("/:employeId/temps-travail", verifyToken, requireRole("administrateur", "responsable", "manager", "employe"), pointageController.calculerTempsTravail);

module.exports = router;
//test