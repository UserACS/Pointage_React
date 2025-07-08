const mongoose = require("mongoose");

const planningSchema = new mongoose.Schema({
  intitule: { type: String, required: true },
  description: { type: String },
  jours: [{ type: mongoose.Schema.Types.ObjectId, ref: "Jour" }]
});

module.exports = mongoose.model("Planning", planningSchema);