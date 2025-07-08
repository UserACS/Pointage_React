const express = require("express");
const router = express.Router();
const employeController = require("../controllers/employeController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

// Création (admin)
router.post("/", verifyToken, requireRole("administrateur"), employeController.ajouterEmploye);
// Lecture (admin, responsable)
router.get("/", verifyToken, requireRole("administrateur", "responsable"), employeController.listerEmployes);
// Lecture par id (tous, mais employé ne voit que son propre profil)
router.get("/:id", verifyToken, requireRole("administrateur", "responsable", "manager", "employe"), employeController.voirUnEmploye);
// Modification (admin)
router.put("/:id", verifyToken, requireRole("administrateur"), employeController.modifierEmploye);
// Suppression (admin)
router.delete("/:id", verifyToken, requireRole("administrateur"), employeController.supprimerEmploye);
// Modifier son propre profil (employé, manager, responsable)
router.put("/me", verifyToken, requireRole("employe", "responsable", "manager"), employeController.modifierProfil);

module.exports = router;