const express = require('express');
const router = express.Router();
const pointageController = require('../Controllers/pointageController');

// Route pour calculer le temps de travail
router.get('/temps-travail/:id', pointageController.calculerTempsTravail);

// Route pour lister les pointages d'un employé
router.get('/:id', pointageController.listerPointages);

// Route pour enregistrer un pointage
router.post('/', pointageController.enregistrerPointage);

module.exports = router;
// commit de test dans backend_pointage
