const Affectation = require("../models/Affectation");

// Créer une affectation
exports.creerAffectation = async (req, res) => {
  try {
    const affectation = new Affectation(req.body);
    await affectation.save();
    res.status(201).json(affectation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lister toutes les affectations
exports.listerAffectations = async (req, res) => {
  try {
    const affectations = await Affectation.find()
      .populate("employe", "nom prenom")
      .populate("equipe", "intitule");
    res.json(affectations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Terminer une affectation (mettre une date de fin)
exports.terminerAffectation = async (req, res) => {
  try {
    const affectation = await Affectation.findByIdAndUpdate(
      req.params.id,
      { quitte_jour: new Date() },
      { new: true }
    );
    if (!affectation) return res.status(404).json({ message: "Affectation non trouvée" });
    res.json(affectation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Historique d'affectations d'un employé
exports.historiqueAffectationsEmploye = async (req, res) => {
  try {
    const affectations = await Affectation.find({ employe: req.params.employeId })
      .populate("equipe", "intitule");
    res.json(affectations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};