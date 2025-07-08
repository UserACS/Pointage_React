const express = require("express");
const router = express.Router();
const userController = require("../Controllers/userController");

// Inscription 
router.post("/register", userController.register);
// Connexion
router.post("/login", userController.login);
// Déconnexion 
router.post("/logout", userController.logout); 


module.exports = router;