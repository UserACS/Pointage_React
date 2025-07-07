const express = require('express');
const router = express.Router();
const employeController = require('../Controllers/employeController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

router.post('/', employeController.ajouterEmploye);
router.get('/', employeController.listerEmployes);
router.put('/:id', employeController.modifierEmploye);
router.delete('/:id', employeController.supprimerEmploye);

module.exports = router;
