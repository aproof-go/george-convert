import express from 'express';
import multer from 'multer';
import path from 'path';
import { ConvertController } from '../controllers/convertController';
import { fileHelper } from '../utils/fileHelper';

const router = express.Router();
const controller = new ConvertController();

// 配置文件上传
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    await fileHelper.ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  }
});

const fileFilter = (
  req: express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // 只允许 epub 文件
  if (file.mimetype === 'application/epub+zip' || 
      path.extname(file.originalname).toLowerCase() === '.epub') {
    cb(null, true);
  } else {
    cb(new Error('只支持 EPUB 格式的电子书'));
  }
};

// 路由
router.post('/upload', upload.single('file'), controller.upload);
router.get('/status/:fileId', controller.getStatus);

export { router as convertRoutes };