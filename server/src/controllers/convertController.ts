import { Request, Response } from 'express';
import { ConvertService } from '../services/convertService';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class ConvertController {
  private convertService: ConvertService;

  constructor() {
    this.convertService = new ConvertService();
  }

  upload = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: '没有上传文件' });
      }

      const { targetFormat } = req.body;
      if (!targetFormat) {
        return res.status(400).json({ error: '未指定目标格式' });
      }

      console.log('收到文件:', req.file.originalname, '目标格式:', targetFormat);

      const uploadedFile = req.file;
      const fileId = uuidv4();
      const originalExt = path.extname(uploadedFile.originalname);
      
      const conversionJob = {
        fileId,
        originalPath: uploadedFile.path,
        targetFormat,
        originalName: uploadedFile.originalname,
        originalExt
      };

      const result = await this.convertService.convert(conversionJob);
      
      res.json({
        message: '转换成功',
        downloadUrl: `/converted/${result.fileName}`,
        fileId: result.fileId
      });
    } catch (error) {
      console.error('转换错误:', error);
      res.status(500).json({ error: '文件转换失败' });
    }
  };

  getStatus = async (req: Request, res: Response) => {
    const { fileId } = req.params;
    const status = await this.convertService.getConversionStatus(fileId);
    res.json({ status });
  };
}