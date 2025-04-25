const Patient = require("../model/patientSchema");

const submitPatientForm = async (req, res) => {
  try {
    // Access the form data and the file
    const { name, dob, gender, symptom, severity, symptomDuration } = req.body;
    const file = req.file; // The uploaded file

    if (!file) {
      return res.status(400).json({ success: false, error: 'File is required' });
    }

    // Log the form data and file to check
    console.log('Form Data:', { name, dob, gender, symptom, severity, symptomDuration });
    console.log('Uploaded File:', file);

    // Create a new patient entry
    const newPatient = new Patient({
      name,
      dob,
      gender,
      symptom,
      severity,
      symptomDuration,
      fileUrl: file.path,  // Storing file path in DB
    });

    await newPatient.save();

    res.status(201).json({ success: true, message: 'Patient form submitted successfully', patient: newPatient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getPatientForms = async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { submitPatientForm, getPatientForms };
