const mongoose = require("mongoose");

const jourSchema = new mongoose.Schema({
  nom: { type: String, enum: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"], required: true },
  h_entrée1: { type: String }, // "08:00"
  h_sortie1: { type: String }, // "12:00"
  h_entrée2: { type: String }, // "14:00"
  h_sortie2: { type: String }  // "18:00"
});

module.exports = mongoose.model("Jour", jourSchema);