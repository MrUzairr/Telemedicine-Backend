const express = require("express");
const { sendDoctorNotification } = require("../controller/notificationController");

const router = express.Router();

// POST route to send notification
router.post("/send-notification", sendDoctorNotification);

module.exports = router;
