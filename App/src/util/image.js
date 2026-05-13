export const generateBase64FromImage = imageFile => {
  const reader = new FileReader();
  const promise = new Promise((resolve, reject) => {
    reader.onload = e => resolve(e.target.result);
    reader.onerror = err => reject(err);
  });

  reader.readAsDataURL(imageFile);
  return promise;
};

export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/webp',
];

/**
 * Client-side validation for image uploads.
 * Throws a user-friendly Error if the file is invalid.
 * Returns the file unchanged when valid (handy for chaining).
 */
export const validateImageFile = (file, { maxBytes = 10 * 1024 * 1024 } = {}) => {
  if (!file) {
    throw new Error('Please choose an image.');
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type. Please choose a PNG, JPG, or WebP image.');
  }
  if (file.size > maxBytes) {
    const limitMb = Math.round(maxBytes / (1024 * 1024));
    throw new Error(`That image is too large. Please choose a file under ${limitMb} MB.`);
  }
  return file;
};
