const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dbpgojr4m",
  api_key: process.env.CLOUDINARY_API_KEY || "763362257473318",
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a single image file buffer to Cloudinary
 */
const uploadSingleImage = async (file, folder = "raj_exam_vault/profiles") => {
  if (!file) throw new Error("No file provided for upload");

  if (!file.mimetype || !file.mimetype.startsWith("image/")) {
    throw new Error("Only image files (JPG, PNG, WEBP, etc.) are allowed");
  }

  const fileData = file.buffer || file.data;
  if (!fileData) {
    throw new Error("File buffer or data is missing");
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 500, height: 500, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" }
        ]
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format
        });
      }
    );
    uploadStream.end(fileData);
  });
};

/**
 * Upload multiple image files to Cloudinary
 */
const uploadImages = async (files, folder = "raj_exam_vault/images") => {
  const fileArray = Array.isArray(files) ? files : Object.values(files);
  const uploadedImages = [];

  for (const file of fileArray) {
    try {
      const result = await uploadSingleImage(file, folder);
      uploadedImages.push(result);
    } catch (error) {
      console.error("Image upload failed:", error.message);
    }
  }

  return uploadedImages;
};

/**
 * Delete an image by public_id from Cloudinary
 */
const deleteImage = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Failed to delete Cloudinary asset:", error.message);
    return null;
  }
};

module.exports = {
  cloudinary,
  uploadSingleImage,
  uploadImages,
  deleteImage
};