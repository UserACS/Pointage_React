const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: "Employe", required: true },
  entree: { type: Date, required: true },
  sortie: { type: Date, required: true }
});

module.exports = mongoose.model("Shift", shiftSchema);