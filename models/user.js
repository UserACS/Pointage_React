// models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["administrateur", "utilisateur", "employé"],
    required: true
  }
});

module.exports = mongoose.model("user", userSchema);
