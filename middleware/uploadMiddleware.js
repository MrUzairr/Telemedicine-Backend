// middlewares/uploadMiddleware.js
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/patientData');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir); // Save files in the "public/patientData" folder
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    cb(null, Date.now() + '-' + file.originalname);
  },
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'image/png',
    'image/jpg',
    'image/jpeg',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, PNG, JPG, and JPEG files are allowed!'), false);
  }
};

// Set file size limit (5MB)
const limits = { fileSize: 5 * 1024 * 1024 }; // 5MB

// Initialize multer
const upload = multer({ storage, limits, fileFilter });

// Middleware to handle a single file upload
const uploadFile = (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
    next();  // Proceed to the next middleware or route handler
  });
};

module.exports = uploadFile;
