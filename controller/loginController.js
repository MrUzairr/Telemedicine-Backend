const bcrypt = require("bcrypt");
const User = require("../model/userModel");
const Doctor = require('../model/doctorModel');
const generateLoginToken = require("./userController");
const RefreshToken = require("../model/refreshTokenModel");

const { oauth2Client } = require("../utils/google_config");
const axios = require("axios");
const JWT_TIMEOUT = process.env.JWT_TIMEOUT;
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const authService = require("../services/authService");

async function loginUser(req, res, next) {
  const { email, password } = req.body;
  try {
    // Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    console.log("user",user)
      // If not found in User model, check Doctor model
    if (!user) {
      user = await Doctor.findOne({ email });
      console.log("doctor",user)

      if (!user) {
        return res.status(404).json({ message: "User or Doctor not found" });
      }
    }

    // Validate password
    // For User model, validate the password using bcrypt
    let isPasswordValid;
    if (!user.isDoctor) {
      // For User (hashed password), compare using bcrypt
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // For Doctor, skip password check entirely
      isPasswordValid = true; // Assume the doctor is validated without password check
    }

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    console.log("Doctor role",user.isDoctor)
    // Generate JWT token for the logged-in user
    // Generate both access and refresh tokens
    const accessToken = authService.signAccessToken({ _id: user._id }, "30m");
    const refreshToken = authService.signRefreshToken({ _id: user._id }, "60m");

    // update refresh token in database
    await RefreshToken.updateOne(
      {
        _id: user._id,
      },
      { token: refreshToken },
      { upsert: true }
    );
    // const token = generateLoginToken.GenerateToken(user);
    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    return res.status(200).json({
      message: "Logged in successfully",
      email: user.email,
      userid: user.id,
      isAdmin: user.isAdmin,
      accessToken, // Send access token
      auth: true,
      isDoctor:user.isDoctor,
      fullName: user.fullName
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

const logout = async (req, res, next) => {
  // 1. delete refresh token from db
  const refreshToken = req.cookie;

  try {
    await RefreshToken.deleteOne({ token: refreshToken });
  } catch (error) {
    return next(error);
  }

  // delete cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  // 2. response
  res.status(200).json({ user: null, auth: false });
};

const refresh = async (req, res, next) => {
  // 1. get refreshToken from cookies
  // 2. verify refreshToken
  // 3. generate new tokens
  // 4. update db, return response

  const originalRefreshToken = req.cookies.refreshToken;

  let id;
  try {
    id = JWTService.verifyRefreshToken(originalRefreshToken)._id;
  } catch (e) {
    const error = {
      status: 401,
      message: "Unauthorized",
    };
    return next(error);
  }

  try {
    const match = RefreshToken.findOne({
      _id: id,
      token: originalRefreshToken,
    });

    if (!match) {
      const error = {
        status: 401,
        message: "Unauthorized",
      };
      return next(error);
    }
  } catch (e) {
    return next(e);
  }

  try {
    const accessToken = authService.signAccessToken({ _id: id }, "30m");
    const refreshToken = authService.signRefreshToken({ _id: id }, "60m");

    await RefreshToken.updateOne({ _id: id }, { token: refreshToken });

    res.cookie("accessToken", accessToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });

    res.cookie("refreshToken", refreshToken, {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
    });
  } catch (e) {
    return next(e);
  }

  const user = await User.findOne({ _id: id });

  return res.status(200).json({ user: user, auth: true });
};
// async function loginUser(req, res, next) {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // Compare the hashed password using bcrypt
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

//     // Generate JWT token for the logged-in user
//     // Generate both access and refresh tokens
//     const { accessToken, refreshToken } = generateLoginToken.GenerateTokens(user);
//     // const token = generateLoginToken.GenerateToken(user);
//     // Set a short expiration time for testing (1 minute)
//     const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // Set refresh token to expire in 1 minute for testing

//     // Save the refresh token to the database
//     const newRefreshToken = new RefreshToken({
//       userId: user._id,
//       token: refreshToken,
//       expiresAt: expiresAt,
//     });

//     await newRefreshToken.save();  // Save refresh token to the database

//     // Set the refresh token in an HttpOnly cookie (for security)
//     res.cookie('refreshToken', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 1 * 60 * 1000, // Set cookie to expire in 1 minute
//     });

//     return res.status(200).json({
//       message: "Logged in successfully",
//       email: user.email,
//       userid: user.id,
//       isAdmin: user.isAdmin,
//       accessToken  // Send access token
//     });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// }

// Google Authentication with Access and Refresh Tokens
const googleAuthLogin = async (req, res, next) => {
  const code = req.query.code;
  try {
    // Exchange the Google auth code for tokens
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);

    // Fetch user info from Google using the access token
    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { email, name, picture } = userRes.data;

    // Check if the user exists in the database
    let user = await User.findOne({ email });
    console.log("user", user);
    if (!user) {
      // If the user doesn't exist, return User not found
      return res.status(404).json({ message: "User not found" });

    }

    // Generate both access and refresh tokens
    const { accessToken, refreshToken } =
      generateLoginToken.GenerateTokens(user);
    console.log("refresh", refreshToken);
    // Set a short expiration time for refresh token (for testing purposes, 1 minute)
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // Set refresh token to expire in 1 minute for testing

    // Save the refresh token to the database
    const newRefreshToken = new RefreshToken({
      userId: user._id,
      token: refreshToken,
      expiresAt: expiresAt,
    });
    // Refresh token saving process
    try {
      console.log("before newRefreshToken", newRefreshToken);

      // Validate before saving
      const validationError = newRefreshToken.validateSync();
      if (validationError) {
        console.error("Validation error:", validationError);
        throw new Error("Validation error");
      }

      // Save refresh token to the database
      await newRefreshToken.save();
      console.log("after newRefreshToken", newRefreshToken);
    } catch (error) {
      console.error("Error saving refresh token:", error.message);
    }

    // Set the refresh token in an HttpOnly cookie (for security)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use HTTPS in production
      sameSite: "strict",
      maxAge: 1 * 60 * 1000, // Set cookie to expire in 1 minute (for testing)
    });

    // Send back access token and user info
    return res.status(200).json({
      message: "Google authentication successful",
      accessToken, // Send access token
      refreshToken, // Send refresh token (in case it's needed in client-side)
      user,
      auth: true,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};
// async function loginUser(req, res, next) {
//   const { email, password } = req.body;
//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(404).json({ error: "User not found" });

//     // Compare the hashed password using bcrypt
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

//     // Generate JWT token for the logged-in user
//     // Generate both access and refresh tokens
//     const { accessToken, refreshToken } = generateLoginToken.GenerateTokens(user);
//     // const token = generateLoginToken.GenerateToken(user);
//     // Set a short expiration time for testing (1 minute)
//     const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // Set refresh token to expire in 1 minute for testing

//     // Save the refresh token to the database
//     const newRefreshToken = new RefreshToken({
//       userId: user._id,
//       token: refreshToken,
//       expiresAt: expiresAt,
//     });

//     await newRefreshToken.save();  // Save refresh token to the database

//     // Set the refresh token in an HttpOnly cookie (for security)
//     res.cookie('refreshToken', refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === 'production',
//       sameSite: 'strict',
//       maxAge: 1 * 60 * 1000, // Set cookie to expire in 1 minute
//     });

//     return res.status(200).json({
//       message: "Logged in successfully",
//       email: user.email,
//       userid: user.id,
//       isAdmin: user.isAdmin,
//       accessToken  // Send access token
//     });
//   } catch (err) {
//     return res.status(500).json({ message: err.message });
//   }
// }

// Google Authentication with Access and Refresh Tokens

// const googleAuth = async (req, res, next) => {
//   const code = req.query.code;
//   try {
//       const googleRes = await oauth2Client.getToken(code);
//       oauth2Client.setCredentials(googleRes.tokens);
//       const userRes = await axios.get(
//         `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
//       );
//       const { email, name, picture } = userRes.data;
//       let user = await User.findOne({ email });

//       if (!user) {
//         const newUser = new User({
//           name,
//           email,
//           picture
//         });
//         user = await newUser.save();
//       }

//       const token = generateLoginToken.GenerateToken(user);
//       console.log("token",token)

//       res.status(200).json({
//           message: 'success',
//           token,
//           user,
//       });
//   } catch (err) {
//       res.status(500).json({
//           message: "Internal Server Error"
//       })
//   }
// };

module.exports = { loginUser, logout, refresh, googleAuthLogin };
