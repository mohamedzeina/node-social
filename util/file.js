const path = require('path');
const fs = require('fs');

const clearImage = (filePath) => {
  // Helper function that clears images from the file system
  filePath = path.join(__dirname, '..', 'Backend', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.clearImage = clearImage;
