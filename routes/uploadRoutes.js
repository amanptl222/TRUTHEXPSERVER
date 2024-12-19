const express = require('express');
const multer = require('multer'); // File upload handler
const path = require('path');
const {authenticate, restrictToAdmin} = require('../middlewares/auth'); // Import the authentication middleware

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to store uploaded images
  },
  filename: (req, file, cb) => {
    // Unique filename using timestamp
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Route for image upload (requires authentication)
router.post('/upload-image', authenticate, restrictToAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }

  // Image URL to be sent in the response
  const imageUrl = `${process.env.BASE_URL}/uploads/${req.file.filename}`;
  
  // Respond with the image URL
  res.json({ url: imageUrl });
});

module.exports = router;
