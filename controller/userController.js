const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/userModel'); // Path to your User model file
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET 
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET 
const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE 
const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE 
const JWT_TIMEOUT = process.env.JWT_TIMEOUT 
const RefreshToken = require("../model/refreshTokenModel");
const authService = require('../services/authService');

// Secret key for JWT (in a real application, use an environment variable)
const JWT_SECRET = process.env.JWT_SECRET;

// Route to register a new user
async function addUser(req,res){
  const { first_name, last_name, email, password, zip_code, gender, date_of_birth } = req.body;
  try {
    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    // store data in db
    let accessToken;
    let refreshToken;
    let user;
    try{
      const newUser = new User({
        first_name,
        last_name,
        email,
        password: hashedPassword,
        zip_code,
        gender,
        date_of_birth,
        is_varified: false
      });
      user = await newUser.save();

      // token generation 
      accessToken = authService.signAccessToken({_id: user._id},'30m');
      refreshToken = authService.signRefreshToken({_id: user._id},'60m');
    }
    catch(error){
      return next(error);

    }

    // store refresh token in db
    await authService.storeRefreshToken(refreshToken,user._id);

    // send tokens in cookie
    res.cookie('accessToken',accessToken,{
      maxAge: 1000*60*60*24,
      httpOnly: true
    })
    res.cookie('refreshToken',refreshToken,{
        maxAge: 1000*60*60*24,
        httpOnly: true
    })
    
    res.status(201).json({
      message: 'User registered successfully',
      token, // Include the token for immediate login, if desired
      user: {
        id: savedUser._id,
        email: savedUser.email,
        first_name: savedUser.first_name,
        last_name: savedUser.last_name,
        isAdmin: savedUser.isAdmin,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};
const googleAuthRegister = async (req, res, next) => {
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
      const newUser = new User({
        name,
        email,
        picture,
      });
      user = await newUser.save();
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

async function getAllUser(req,res){
    try {
        const users = await User.find();
        res.status(201).json(users);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

async function updateUser(req,res){
    try {
        console.log(req.params.id)
        console.log(req.body)
        const users = await User.findByIdAndUpdate(req.params.id,req.body,{new:true});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}
async function deleteUser(req,res){
    try {
        const users = await User.findByIdAndDelete(req.params.id);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}


// Function to generate access and refresh tokens

function GenerateTokens(user) {
  console.log("GenerateTokens function called");

  const accessPayload = {
    id: user._id,
    role: user.role,
  };

  console.log("JWT_TIMEOUT value:", JWT_TIMEOUT);

  try {
    const accessToken = jwt.sign(accessPayload, JWT_SECRET, { expiresIn: JWT_TIMEOUT || '1h' });
    const refreshToken = jwt.sign(accessPayload, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    console.log("Generated Access Token: ", accessToken);
    console.log("Generated Refresh Token: ", refreshToken);

    return { accessToken, refreshToken };
  } catch (err) {
    console.error("Error generating tokens: ", err.message);
    throw new Error("Error generating JWT tokens: " + err.message);
  }
}

// function GenerateTokens(user) {
//   console.log("GenerateTokens function called");

//   const accessPayload = {
//     id: user._id,
//     role: user.role,
//   };

//   try {
//     const accessToken = jwt.sign(accessPayload, JWT_SECRET, { expiresIn: JWT_TIMEOUT });
//     const refreshToken = jwt.sign(accessPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });

//     console.log("Generated Access Token: ", accessToken);
//     console.log("Generated Refresh Token: ", refreshToken);

//     return { accessToken, refreshToken };
//   } catch (err) {
//     console.error("Error generating tokens: ", err.message);
//     throw new Error("Error generating JWT tokens: " + err.message);
//   }
// }

// function GenerateTokens(user) {
//   // Define the payload for the access token
//   const accessPayload = {
//     id: user._id,
//     role: user.role, // Include any role or other claim you want to attach to the token
//   };

//   // Generate access token with a short expiration time (1 hour)
//   const accessToken = jwt.sign(accessPayload, JWT_SECRET, { expiresIn: JWT_TIMEOUT });

//   // Generate refresh token with a longer expiration time (7 days)
//   const refreshToken = jwt.sign(accessPayload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
//   console.log("Generated Access Token: ", accessToken);
//     console.log("Generated Refresh Token: ", refreshToken);
//   return { accessToken, refreshToken };
// }
// // // Functions for user
function GenerateToken(user) {
  const payload = {
    role: user.role,  // User's role, could be 'admin', 'user', etc.
    id: user._id,     // User's unique ID
  };

  try {
    // Adding a token expiration time of 1 hour (you can change it as per your requirement)
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    return token;
  } catch (err) {
    throw new Error("Error generating JWT token: " + err.message);
  }
}




module.exports = {
    getAllUser,
    addUser,
    updateUser,
    deleteUser,
    GenerateTokens,
    GenerateToken,
    googleAuthRegister

};