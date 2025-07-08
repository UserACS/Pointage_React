const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");

// Inscription de l'administrateur (optionnel, à restreindre)
router.post("/register", userController.register);
// Connexion (tous)
router.post("/login", userController.login);

module.exports = router;