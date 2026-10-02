const appConfig = require('../../config/appConfig');
const LocalStorageProvider = require('./LocalStorageProvider');
const CloudinaryStorageProvider = require('./CloudinaryStorageProvider');

let activeProvider;

// Instantiate provider based on config
if (appConfig.storage.provider === 'cloudinary' && appConfig.cloudinary.cloudName) {
  activeProvider = new CloudinaryStorageProvider();
  console.log('📦 Storage Engine: Cloudinary Cloud Storage Active');
} else {
  activeProvider = new LocalStorageProvider();
  console.log('📦 Storage Engine: Local Disk Storage Active (/uploads)');
}

class StorageService {
  /**
   * Upload file to active storage provider
   * @param {Object} file
   * @param {string} folder
   */
  static async uploadFile(file, folder = 'general') {
    return activeProvider.upload(file, folder);
  }

  /**
   * Delete file from active storage provider
   * @param {string} publicIdOrPath
   */
  static async deleteFile(publicIdOrPath) {
    return activeProvider.delete(publicIdOrPath);
  }

  /**
   * Get current storage provider name
   */
  static getProviderName() {
    return appConfig.storage.provider;
  }
}

module.exports = StorageService;
