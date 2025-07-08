const mongoose = require("mongoose");

const employeSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  dateNaissance: { type: Date },
  lieuNaissance: { type: String },
  adresse: { type: String },
  poste: { type: String },
  photo: { type: String },
  telephonePerso: { type: String },
  telephonePro: { type: String },
  presence: { type: Boolean, default: false },
  empreinte_hash: { type: String, unique: true, required: true },
  planning: { type: mongoose.Schema.Types.ObjectId, ref: "Planning" },
  equipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Equipe" }],
  role: {
    type: String,
    enum: ["employe", "responsable", "manager"],
    required: true,
    default: "employe"
  }
}, { timestamps: true });

module.exports = mongoose.model("Employe", employeSchema);