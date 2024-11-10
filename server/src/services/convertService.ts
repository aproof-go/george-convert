import { exec } from 'child_process';
import path from 'path';
import { promisify } from 'util';
import { config } from '../config/config';
import { fileHelper } from '../utils/fileHelper';

const execAsync = promisify(exec);

interface ConversionJob {
  fileId: string;
  originalPath: string;
  targetFormat: string;
  originalName: string;
  originalExt: string;
}

export class ConvertService {
  private conversionStatus: Map<string, string>;

  constructor() {
    this.conversionStatus = new Map();
  }

  async convert(job: ConversionJob) {
    this.conversionStatus.set(job.fileId, 'processing');
    console.log('开始转换:', job);

    try {
      const outputFileName = `${job.fileId}.${job.targetFormat}`;
      const outputPath = path.join(config.convertedDir, outputFileName);

      // 确保输出目录存在
      await fileHelper.ensureDirectoryExists(config.convertedDir);

      switch (job.targetFormat.toLowerCase()) {
        case 'mobi':
        case 'azw3':
          await this.convertEbook(job.originalPath, outputPath, job.targetFormat);
          break;
        default:
          throw new Error(`不支持的格式: ${job.targetFormat}`);
      }

      console.log('转换完成:', outputFileName);
      this.conversionStatus.set(job.fileId, 'completed');
      
      // 清理原始文件
      await fileHelper.cleanupFile(job.originalPath);
      
      return {
        fileId: job.fileId,
        fileName: outputFileName
      };
    } catch (error) {
      console.error('转换失败:', error);
      this.conversionStatus.set(job.fileId, 'failed');
      throw error;
    }
  }

  private async convertEbook(inputPath: string, outputPath: string, format: string): Promise<void> {
    try {
      // 使用 Calibre 的 ebook-convert 命令
      const command = `ebook-convert "${inputPath}" "${outputPath}" --output-profile kindle`;
      console.log('执行转换命令:', command);
      
      const { stdout, stderr } = await execAsync(command);
      console.log('转换输出:', stdout);
      
      if (stderr) {
        console.error('转换警告:', stderr);
      }
    } catch (error) {
      console.error('电子书转换失败:', error);
      throw error;
    }
  }

  getConversionStatus(fileId: string): string {
    return this.conversionStatus.get(fileId) || 'not_found';
  }
}