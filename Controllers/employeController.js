const Employe = require('../models/Employe');

exports.ajouterEmploye = async (req, res) => {
  try {
    const employe = new Employe(req.body);
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
// Modifier un employé
exports.modifierEmploye = async (req, res) => {
  try {
    const employeId = req.params.id;
    const { nom, prenom, fonction } = req.body;

    const employeModifie = await Employe.findByIdAndUpdate(
      employeId,
      { nom, prenom, fonction },
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

// Supprimer un employé
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
