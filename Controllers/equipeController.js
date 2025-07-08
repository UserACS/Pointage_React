const Equipe = require("../models/Equipe");
const Employe = require("../models/Employe");

// Créer une équipe
exports.creerEquipe = async (req, res) => {
  try {
    const equipe = new Equipe(req.body);
    await equipe.save();
    res.status(201).json(equipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lister toutes les équipes
exports.listerEquipes = async (req, res) => {
  try {
    const equipes = await Equipe.find().populate("membres", "nom prenom");
    res.json(equipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Voir une équipe
exports.voirEquipe = async (req, res) => {
  try {
    const equipe = await Equipe.findById(req.params.id).populate("membres", "nom prenom");
    if (!equipe) return res.status(404).json({ message: "Équipe non trouvée" });
    res.json(equipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier une équipe
exports.modifierEquipe = async (req, res) => {
  try {
    const equipe = await Equipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!equipe) return res.status(404).json({ message: "Équipe non trouvée" });
    res.json(equipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer une équipe
exports.supprimerEquipe = async (req, res) => {
  try {
    const equipe = await Equipe.findByIdAndDelete(req.params.id);
    if (!equipe) return res.status(404).json({ message: "Équipe non trouvée" });
    res.json({ message: "Équipe supprimée" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ajouter un membre à une équipe
exports.ajouterMembre = async (req, res) => {
  try {
    const equipe = await Equipe.findById(req.params.id);
    if (!equipe) return res.status(404).json({ message: "Équipe non trouvée" });
    const { employeId } = req.body;
    if (!equipe.membres.includes(employeId)) {
      equipe.membres.push(employeId);
      await equipe.save();
    }
    res.json(equipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Retirer un membre d'une équipe
exports.retirerMembre = async (req, res) => {
  try {
    const equipe = await Equipe.findById(req.params.id);
    if (!equipe) return res.status(404).json({ message: "Équipe non trouvée" });
    const { employeId } = req.body;
    equipe.membres = equipe.membres.filter(id => id.toString() !== employeId);
    await equipe.save();
    res.json(equipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lister les membres d'une équipe
exports.listerMembres = async (req, res) => {
  try {
    const equipe = await Equipe.findById(req.params.id).populate("membres", "nom prenom");
    if (!equipe) return res.status(404).json({ message: "Équipe non trouvée" });
    res.json(equipe.membres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};