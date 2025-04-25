require("dotenv").config();
const twilio = require("twilio");

// Load Twilio credentials
const client = new twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Function to send SMS notification
const sendNotification = async (doctorPhone, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: doctorPhone, // Doctor's phone number
    });
    console.log("Notification sent:", response.sid);
    return response;
  } catch (error) {
    console.error("Twilio Error:", error.message);
    throw error;
  }
};

module.exports = { sendNotification };
