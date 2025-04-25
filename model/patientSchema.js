const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: String, required: true },
  gender: { type: String, required: true },
  symptom: { type: String, required: true },
  severity: { type: String, required: true },
  symptomDuration: { type: String, required: true },
  fileUrl: { type: String, required: true }, // Stores file path or URL
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Patient", patientSchema);
