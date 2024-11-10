import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs-extra';
import { WebSocket, WebSocketServer } from 'ws';
import { createServer } from 'http';
import { exec } from 'child_process';

const app = express();
const server = createServer(app);

// 定义上传和转换目录
const uploadDir = path.join(__dirname, '../uploads');
const convertDir = path.join(__dirname, '../converted');

// 确保目录存在
fs.ensureDirSync(uploadDir);
fs.ensureDirSync(convertDir);

// CORS 配置
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-Client-ID'],
  credentials: false
}));

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// WebSocket 配置
const wss = new WebSocketServer({ server });
const clients = new Map<string, WebSocket>();

wss.on('connection', (ws) => {
  const clientId = Math.random().toString(36).substring(7);
  clients.set(clientId, ws);
  
  ws.send(JSON.stringify({ type: 'connected', clientId }));
  
  ws.on('close', () => {
    clients.delete(clientId);
  });
});

// 文件转换函数
async function convertFile(
  inputPath: string, 
  outputPath: string, 
  clientId: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const process = exec(`ebook-convert "${inputPath}" "${outputPath}"`);
    
    process.stderr?.on('data', (data: string) => {
      // 发送进度信息到客户端
      const ws = clients.get(clientId);
      if (ws) {
        const progressMatch = data.toString().match(/(\d+)%/);
        if (progressMatch) {
          ws.send(JSON.stringify({
            type: 'progress',
            progress: parseInt(progressMatch[1])
          }));
        }
      }
    });

    process.on('error', reject);
    process.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`转换失败，退出码: ${code}`));
    });
  });
}

// 修改转换接口
app.post('/convert', upload.single('file'), async (req, res) => {
  const clientId = req.headers['x-client-id'] as string;
  
  try {
    if (!req.file || !req.body.targetFormat) {
      return res.status(400).json({ 
        success: false, 
        error: '缺少文件或目标格式' 
      });
    }

    const inputPath = req.file.path;
    const outputFileName = path.basename(
      req.file.originalname, 
      path.extname(req.file.originalname)
    ) + '.' + req.body.targetFormat;
    const outputPath = path.join(convertDir, outputFileName);

    // 确保输出目录存在
    await fs.ensureDir(convertDir);

    // 执行转换
    await convertFile(inputPath, outputPath, clientId);

    // 读取转换后的文件
    const convertedFile = await fs.readFile(outputPath);

    // 设置响应头
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader(
      'Content-Disposition', 
      `attachment; filename="${encodeURIComponent(outputFileName)}"`
    );

    // 发送文件
    res.send(convertedFile);

    // 清理临时文件
    try {
      await fs.unlink(inputPath);
      await fs.unlink(outputPath);
    } catch (cleanupError) {
      console.error('清理文件错误:', cleanupError);
    }

  } catch (error) {
    console.error('转换错误:', error);
    res.status(500).json({ 
      success: false, 
      error: '文件转换失败' 
    });

    // 清理上传的文件
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('清理文件错误:', cleanupError);
      }
    }
  }
});

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = 3002;

server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});