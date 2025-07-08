const express = require('express');
const router = express.Router();
const employeController = require('../controllers/employeController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// Ajouter un employé (admin seulement)
router.post('/employes', verifyToken, isAdmin, employeController.ajouterEmploye);
// Lister tous les employés (admin seulement)
router.get('/employes', verifyToken, isAdmin, employeController.listerEmployes);
// Modifier un employé (admin seulement)
router.put('/employes/:id', verifyToken, isAdmin, employeController.modifierEmploye);
// Supprimer un employé (admin seulement)
router.delete('/employes/:id', verifyToken, isAdmin, employeController.supprimerEmploye);
// Voir un employé par ID (admin seulement)
router.get('/employes/:id', verifyToken, isAdmin, employeController.voirUnEmploye);

module.exports = router;