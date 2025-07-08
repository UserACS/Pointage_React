const express = require("express");
const router = express.Router();
const equipeController = require("../controllers/equipeController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Création (admin, responsable)
router.post("/", verifyToken, requireRole("administrateur", "responsable"), equipeController.creerEquipe);
// Lecture (admin, responsable, manager)
router.get("/", verifyToken, requireRole("administrateur", "responsable", "manager"), equipeController.listerEquipes);
// Voir une équipe (admin, responsable, manager, membre)
router.get("/:id", verifyToken, requireRole("administrateur", "responsable", "manager", "employe"), equipeController.voirEquipe);
// Modification (admin, responsable)
router.put("/:id", verifyToken, requireRole("administrateur", "responsable"), equipeController.modifierEquipe);
// Suppression (admin)
router.delete("/:id", verifyToken, requireRole("administrateur"), equipeController.supprimerEquipe);
// Ajouter/retirer un membre
router.post("/:id/ajouter-membre", verifyToken, requireRole("administrateur", "responsable"), equipeController.ajouterMembre);
router.post("/:id/retirer-membre", verifyToken, requireRole("administrateur", "responsable"), equipeController.retirerMembre);
// Lister membres
router.get("/:id/membres", verifyToken, requireRole("administrateur", "responsable", "manager"), equipeController.listerMembres);

module.exports = router;