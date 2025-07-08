const Employe = require('../models/Employe');
const crypto = require('crypto');

// Génère un code empreinte simulé
function generateEmpreinteHash() {
  return "FP-" + crypto.randomBytes(5).toString('hex').toUpperCase();
}

exports.ajouterEmploye = async (req, res) => {
  try {
    const empreinte_hash = generateEmpreinteHash();
    const data = { ...req.body, empreinte_hash };
    const employe = new Employe(data);
    await employe.save();
    res.status(201).json(employe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.listerEmployes = async (req, res) => {
  try {
    const employes = await Employe.find();
    res.json(employes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.voirUnEmploye = async (req, res) => {
  try {
    const employe = await Employe.findById(req.params.id);
    if (!employe) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.json(employe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.modifierEmploye = async (req, res) => {
  try {
    const employeId = req.params.id;
    const data = req.body;
    const employeModifie = await Employe.findByIdAndUpdate(
      employeId,
      data,
      { new: true }
    );
    if (!employeModifie) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.status(200).json(employeModifie);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification de l\'employé' });
  }
};

exports.supprimerEmploye = async (req, res) => {
  try {
    const employeId = req.params.id;
    const employeSupprime = await Employe.findByIdAndDelete(employeId);
    if (!employeSupprime) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.status(200).json({ message: 'Employé supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'employé' });
  }
};

// Modifier son propre profil
exports.modifierProfil = async (req, res) => {
  try {
    const employeId = req.params.id;
    const { adresse, telephonePerso, telephonePro, photo } = req.body;
    const data = { adresse, telephonePerso, telephonePro, photo };
    const employeModifie = await Employe.findByIdAndUpdate(
      employeId,
      data,
      { new: true }
    );
    if (!employeModifie) {
      return res.status(404).json({ message: 'Employé non trouvé' });
    }
    res.status(200).json(employeModifie);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la modification du profil' });
  }
};