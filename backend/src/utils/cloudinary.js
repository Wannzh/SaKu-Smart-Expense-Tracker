const cloudinary = require("cloudinary").v2;

// Cloudinary config (automatically picks up process.env.CLOUDINARY_URL)
cloudinary.config();

/**
 * Upload file buffer from Multer to Cloudinary
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<string>} - Returns secure URL of uploaded image
 */
const uploadToCloudinary = (fileBuffer, folder = "saku") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          console.error("[Cloudinary] Upload error:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadToCloudinary };
