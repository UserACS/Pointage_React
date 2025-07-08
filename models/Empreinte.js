const mongoose = require("mongoose");

const empreinteSchema = new mongoose.Schema({
  employe: { type: mongoose.Schema.Types.ObjectId, ref: "Employe", unique: true },
  empreinte_hash: { type: String, required: true, unique: true }
});

module.exports = mongoose.model("Empreinte", empreinteSchema);