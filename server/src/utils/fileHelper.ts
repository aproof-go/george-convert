import fs from 'fs/promises';
import path from 'path';

export const fileHelper = {
  async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.access(directory);
    } catch {
      await fs.mkdir(directory, { recursive: true });
    }
  },

  async cleanupFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('清理文件失败:', error);
    }
  },

  getFileExtension(filename: string): string {
    return path.extname(filename).toLowerCase();
  }
};