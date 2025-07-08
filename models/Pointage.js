const mongoose = require("mongoose");

const pointageSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: "Employe", required: true },
  empreinte_hash: { type: String, required: true },
  date: { type: Date, default: Date.now },
  type: { type: String, enum: ["entrée", "sortie"], required: true }
});

module.exports = mongoose.model("Pointage", pointageSchema);