const express = require('express');
const router = express.Router();
const doctorController = require('../controller/doctorController');

// Routes
router.post('/doctors',doctorController.upload.single('profilePicture'),doctorController.createDoctor);
router.get('/getalldoctors', doctorController.getAllDoctors);
router.get('/getonedoctor/:id', doctorController.getDoctorById);
router.put('/updatedoctor/:id',doctorController.upload.single('profilePicture'), doctorController.updateDoctor);
router.delete('/deletedoctor/:id', doctorController.deleteDoctor);

module.exports = router;
