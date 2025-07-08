const express = require("express");
const router = express.Router();
const planningController = require("../controllers/planningController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Création (admin, responsable)
router.post("/", verifyToken, requireRole("administrateur", "responsable"), planningController.creerPlanning);
// Lecture (admin, responsable, manager)
router.get("/", verifyToken, requireRole("administrateur", "responsable", "manager"), planningController.listerPlannings);
// Voir un planning
router.get("/:id", verifyToken, requireRole("administrateur", "responsable", "manager", "employe"), planningController.voirPlanning);
// Modification (admin, responsable)
router.put("/:id", verifyToken, requireRole("administrateur", "responsable"), planningController.modifierPlanning);
// Suppression (admin)
router.delete("/:id", verifyToken, requireRole("administrateur"), planningController.supprimerPlanning);
// Assigner un planning à un employé
router.post("/:id/assigner-employe", verifyToken, requireRole("administrateur", "responsable"), planningController.assignerEmploye);
// Planning d’un employé
router.get("/employe/:employeId", verifyToken, requireRole("administrateur", "responsable", "manager", "employe"), planningController.planningEmploye);

module.exports = router;