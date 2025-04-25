const { sendNotification } = require("../services/notificationService");

const sendDoctorNotification = async (req, res) => {
  const { doctorPhone, patientName, appointmentTime } = req.body;

  if (!doctorPhone || !patientName || !appointmentTime) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  const message = `Hello Doctor, you have a new appointment with ${patientName} at ${appointmentTime}.`;

  try {
    await sendNotification(doctorPhone, message);
    res.status(200).json({ success: true, message: "Notification sent to doctor!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { sendDoctorNotification };
