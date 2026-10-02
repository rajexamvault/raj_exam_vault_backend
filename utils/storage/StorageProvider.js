/**
 * Base Abstract Storage Provider Interface
 * Allows swapping between Local Disk, Cloudinary, AWS S3, etc. seamlessly.
 */
class StorageProvider {
  /**
   * Upload a file buffer or stream
   * @param {Object} file - Multer file object or { buffer, originalname, mimetype }
   * @param {string} folder - Sub-directory or Cloud folder
   * @returns {Promise<{ url: string, publicId: string, size: number, format: string }>}
   */
  async upload(file, folder = 'general') {
    throw new Error('upload() must be implemented by storage provider');
  }

  /**
   * Delete a file by URL or publicId
   * @param {string} publicIdOrPath
   * @returns {Promise<boolean>}
   */
  async delete(publicIdOrPath) {
    throw new Error('delete() must be implemented by storage provider');
  }
}

module.exports = StorageProvider;
