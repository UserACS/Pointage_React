const mongoose = require("mongoose");

const affectationSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: "Employe", required: true },
  equipe: { type: mongoose.Schema.Types.ObjectId, ref: "Equipe", required: true },
  planning: { type: mongoose.Schema.Types.ObjectId, ref: "Planning" }, // optionnel
  rejoint_jour: { type: Date, required: true, default: Date.now },
  quitte_jour: { type: Date } // null si toujours actif
});

module.exports = mongoose.model("Affectation", affectationSchema);