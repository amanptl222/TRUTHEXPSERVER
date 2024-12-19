const fs = require('fs');
const path = require('path');

// Generate a URL for uploaded files
exports.generateFileUrl = (filename) => {
  return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${filename}`;
};

// Delete a file from the server
exports.deleteFile = (filename) => {
  const filePath = path.join(__dirname, '../uploads', filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
