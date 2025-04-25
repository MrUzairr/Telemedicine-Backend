const express = require("express");
const router = express.Router();
const authController = require("../controller/authController"); // Import controller

// Route for refreshing the access token
router.post("/refresh", authController.refreshToken);
// Route for logging out
router.post("/logout", authController.logout);

module.exports = router;
