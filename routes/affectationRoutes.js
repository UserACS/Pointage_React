const express = require("express");
const router = express.Router();
const affectationController = require("../controllers/affectationController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Affecter un employé
router.post("/", verifyToken, requireRole("administrateur", "responsable"), affectationController.creerAffectation);
// Lister toutes les affectations
router.get("/", verifyToken, requireRole("administrateur", "responsable"), affectationController.listerAffectations);
// Terminer une affectation
router.put("/:id/fin", verifyToken, requireRole("administrateur", "responsable"), affectationController.terminerAffectation);
// Historique d’un employé
router.get("/employe/:employeId", verifyToken, requireRole("administrateur", "responsable", "manager", "employe"), affectationController.historiqueAffectationsEmploye);

module.exports = router;