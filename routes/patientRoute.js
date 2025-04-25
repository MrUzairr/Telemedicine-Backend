const express = require("express");
const { submitPatientForm, getPatientForms } = require("../controller/patientController");
const uploadFile = require("../middleware/uploadMiddleware");

const router = express.Router();

// POST route to submit form with PDF
router.post("/submit", uploadFile, submitPatientForm);

// GET route to retrieve all patient forms
router.get("/", getPatientForms);

module.exports = router;
