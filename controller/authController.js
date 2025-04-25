const jwt = require('jsonwebtoken');
const RefreshToken = require('../model/refreshTokenModel');  // Import the RefreshToken model
const User = require('../model/userModel');
const { generateToken } = require('./userController');

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;  // Your secret for verifying refresh tokens

// Function to refresh the access token
async function refreshToken(req, res) {
  const refreshToken = req.cookies.refreshToken;  // Get refresh token from the cookie

  if (!refreshToken) {
    return res.status(403).json({ message: 'Refresh token not provided' });
  }

  try {
    // Find the refresh token in the database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    // Check if the refresh token has expired
    if (storedToken.expiresAt < Date.now()) {
      await RefreshToken.deleteOne({ token: refreshToken });  // Delete expired token from DB
      return res.status(403).json({ message: 'Refresh token has expired' });
    }

    // Verify the refresh token
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid refresh token' });
      }

      // Find the user associated with the refresh token
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(403).json({ message: 'User not found' });
      }

      // Generate a new access token
      const { accessToken } = generateToken.GenerateTokens(user);  // Use the GenerateTokens method to get a new access token

      return res.json({ accessToken });
    });
  } catch (err) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

// Controller for logging out (removing the refresh token)
const logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;  // Get refresh token from the cookie

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token not provided" });
  }

  try {
    // Find the refresh token in the database
    const storedToken = await RefreshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(400).json({ message: "Invalid refresh token" });
    }

    // Remove the refresh token from the database
    await RefreshToken.deleteOne({ token: refreshToken });

    // Clear the cookies containing the refresh and access tokens
    res.clearCookie("accessToken");  // Clears the access token cookie
    res.clearCookie("refreshToken");  // Clears the refresh token cookie

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { refreshToken, logout };
