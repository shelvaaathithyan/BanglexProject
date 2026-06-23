const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// Configuration
cloudinary.config({
  secure: true
});
// Cloudinary URL is automatically picked up from the CLOUDINARY_URL env var if no params are passed

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'products',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

module.exports = { cloudinary, storage };
