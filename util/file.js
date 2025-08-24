const path = require('path');
const fs = require('fs');

/**
 * Deletes an image file from the file system.
 *
 * @param {string} filePath - Relative path to the image that should be deleted
 *
 * This helper function:
 * - Resolves the absolute path to the image using `path.join`
 * - Uses `fs.unlink` to remove the file from disk
 * - Logs an error if the deletion fails
 */

const clearImage = (filePath) => {
  filePath = path.join(__dirname, '..', 'Backend', filePath);
  fs.unlink(filePath, (err) => console.log(err));
};

exports.clearImage = clearImage;
