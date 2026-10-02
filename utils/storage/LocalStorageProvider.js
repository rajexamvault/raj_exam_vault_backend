const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const StorageProvider = require('./StorageProvider');
const appConfig = require('../../config/appConfig');

class LocalStorageProvider extends StorageProvider {
  constructor() {
    super();
    this.baseUploadDir = path.join(process.cwd(), appConfig.storage.localUploadDir);
    this._ensureDirectoryExists(this.baseUploadDir);
  }

  _ensureDirectoryExists(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  async upload(file, folder = 'general') {
    if (!file) throw new Error('No file provided for upload');

    const targetDir = path.join(this.baseUploadDir, folder);
    this._ensureDirectoryExists(targetDir);

    const ext = path.extname(file.originalname || file.name || '.pdf');
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(targetDir, uniqueName);

    const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
    if (!buffer) throw new Error('File buffer is empty or unreadable');

    await fs.promises.writeFile(filePath, buffer);

    const relativeUrlPath = `/uploads/${folder}/${uniqueName}`;
    const publicUrl = `http://localhost:${appConfig.port}${relativeUrlPath}`;

    return {
      url: publicUrl,
      publicId: relativeUrlPath,
      size: buffer.length,
      format: ext.replace('.', '').toLowerCase(),
      provider: 'local'
    };
  }

  async delete(publicIdOrPath) {
    if (!publicIdOrPath) return false;
    try {
      const cleanPath = publicIdOrPath.startsWith('/uploads/')
        ? publicIdOrPath.replace('/uploads/', '')
        : publicIdOrPath;
      const fullPath = path.join(this.baseUploadDir, cleanPath);
      if (fs.existsSync(fullPath)) {
        await fs.promises.unlink(fullPath);
        return true;
      }
      return false;
    } catch (err) {
      console.warn(`[LocalStorage] Failed to delete file: ${err.message}`);
      return false;
    }
  }
}

module.exports = LocalStorageProvider;
