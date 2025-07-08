const mongoose = require("mongoose");

const jourSchema = new mongoose.Schema({
  nom: { type: String, enum: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"], required: true },
  h_entrée1: { type: String },
  h_sortie1: { type: String },
  h_entrée2: { type: String },
  h_sortie2: { type: String }
});

module.exports = mongoose.model("Jour", jourSchema);