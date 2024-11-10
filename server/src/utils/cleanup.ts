import fs from 'fs';
import path from 'path';
import { config } from '../config/config';

export const cleanupOldFiles = async () => {
  const MAX_AGE = 24 * 60 * 60 * 1000; // 24小时

  const cleanup = async (directory: string) => {
    // 确保目录存在
    if (!fs.existsSync(directory)) {
      console.warn(`目录不存在: ${directory}`);
      return;
    }

    try {
      const files = await fs.promises.readdir(directory);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(directory, file);
        try {
          const stats = await fs.promises.stat(filePath);
          if (now - stats.mtimeMs > MAX_AGE) {
            await fs.promises.unlink(filePath);
            console.log(`已删除过期文件: ${filePath}`);
          }
        } catch (err) {
          console.error(`处理文件失败 ${filePath}:`, err);
        }
      }
    } catch (err) {
      console.error(`清理目录失败 ${directory}:`, err);
    }
  };

  // 清理上传和转换目录
  await Promise.all([
    cleanup(config.uploadDir),
    cleanup(config.convertedDir)
  ]);
};

// 每小时运行一次清理
setInterval(async () => {
  try {
    await cleanupOldFiles();
  } catch (err) {
    console.error('清理文件时发生错误:', err);
  }
}, 60 * 60 * 1000);
