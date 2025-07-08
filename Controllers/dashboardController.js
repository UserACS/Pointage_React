const Employe = require("../models/Employe");
const Pointage = require("../models/Pointage");
const Equipe = require("../models/Equipe");

// Dashboard personnalisé selon le rôle
exports.dashboard = async (req, res) => {
  try {
    const { role, userId } = req.user;

    if (role === "administrateur") {
      const totalEmployes = await Employe.countDocuments();
      const totalEquipes = await Equipe.countDocuments();
      const totalPointages = await Pointage.countDocuments();
      return res.json({
        role, totalEmployes, totalEquipes, totalPointages,
        message: "Dashboard administrateur"
      });
    }

    if (role === "responsable") {
      const equipes = await Equipe.find({ responsable: userId }).populate("membres", "nom prenom");
      return res.json({
        role, equipes,
        message: "Dashboard responsable"
      });
    }

    if (role === "manager") {
      const equipes = await Equipe.find({ manager: userId }).populate("membres", "nom prenom");
      return res.json({
        role, equipes,
        message: "Dashboard manager"
      });
    }

    if (role === "employe") {
      const employe = await Employe.findById(userId).populate("equipes", "intitule");
      const pointages = await Pointage.find({ employe: userId }).sort({ date: -1 }).limit(10);
      return res.json({
        role, employe, pointages,
        message: "Dashboard employé"
      });
    }

    res.status(400).json({ message: "Rôle non pris en charge." });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};