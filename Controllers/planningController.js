const Planning = require("../models/Planning");
const Employe = require("../models/Employe");

// Créer un planning
exports.creerPlanning = async (req, res) => {
  try {
    const planning = new Planning(req.body);
    await planning.save();
    res.status(201).json(planning);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lister les plannings
exports.listerPlannings = async (req, res) => {
  try {
    const plannings = await Planning.find().populate("jours");
    res.json(plannings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Voir un planning
exports.voirPlanning = async (req, res) => {
  try {
    const planning = await Planning.findById(req.params.id).populate("jours");
    if (!planning) return res.status(404).json({ message: "Planning non trouvé" });
    res.json(planning);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Modifier un planning
exports.modifierPlanning = async (req, res) => {
  try {
    const planning = await Planning.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!planning) return res.status(404).json({ message: "Planning non trouvé" });
    res.json(planning);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Supprimer un planning
exports.supprimerPlanning = async (req, res) => {
  try {
    const planning = await Planning.findByIdAndDelete(req.params.id);
    if (!planning) return res.status(404).json({ message: "Planning non trouvé" });
    res.json({ message: "Planning supprimé" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assigner un planning à un employé
exports.assignerEmploye = async (req, res) => {
  try {
    const { employeId } = req.body;
    const planning = await Planning.findById(req.params.id);
    if (!planning) return res.status(404).json({ message: "Planning non trouvé" });
    const employe = await Employe.findById(employeId);
    if (!employe) return res.status(404).json({ message: "Employé non trouvé" });
    employe.planning = planning._id;
    await employe.save();
    res.json({ message: "Planning assigné à l'employé", planning });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Voir le planning d'un employé
exports.planningEmploye = async (req, res) => {
  try {
    const employe = await Employe.findById(req.params.employeId).populate({
      path: "planning",
      populate: { path: "jours" }
    });
    if (!employe || !employe.planning) return res.status(404).json({ message: "Aucun planning pour cet employé" });
    res.json(employe.planning);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};