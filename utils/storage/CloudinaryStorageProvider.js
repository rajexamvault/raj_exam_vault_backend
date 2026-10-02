const cloudinary = require('cloudinary').v2;
const StorageProvider = require('./StorageProvider');
const appConfig = require('../../config/appConfig');

class CloudinaryStorageProvider extends StorageProvider {
  constructor() {
    super();
    cloudinary.config({
      cloud_name: appConfig.cloudinary.cloudName,
      api_key: appConfig.cloudinary.apiKey,
      api_secret: appConfig.cloudinary.apiSecret
    });
  }

  async upload(file, folder = 'raj_exam_vault') {
    if (!file) throw new Error('No file provided for upload');

    const isImage = file.mimetype && file.mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    const uploadOptions = {
      folder: `raj_exam_vault/${folder}`,
      resource_type: resourceType
    };

    if (resourceType === 'raw' && file.originalname) {
      const cleanName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
      uploadOptions.public_id = `${Date.now()}_${cleanName}`;
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes,
            format: result.format || (isImage ? 'jpg' : 'pdf'),
            resourceType,
            provider: 'cloudinary'
          });
        }
      );

      const buffer = file.buffer || (file.path ? require('fs').readFileSync(file.path) : null);
      if (!buffer) return reject(new Error('File buffer is empty'));

      uploadStream.end(buffer);
    });
  }

  async delete(publicId, resourceType = 'image') {
    if (!publicId) return false;
    try {
      const res = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
      if (res.result !== 'ok' && resourceType === 'image') {
        const rawRes = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
        return rawRes.result === 'ok';
      }
      return res.result === 'ok';
    } catch (err) {
      console.warn(`[Cloudinary] Failed to delete file: ${err.message}`);
      return false;
    }
  }
}

module.exports = CloudinaryStorageProvider;
