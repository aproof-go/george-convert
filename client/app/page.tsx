'use client'

import { Upload, FileType, Download, Package } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import ContentSections from './components/ContentSections';

interface UploadedFile {
  id: string;
  file: File;
  targetFormat?: string;
  status: 'pending' | 'converting' | 'completed' | 'error';
  progress: number;
  convertedUrl?: string;
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [clientId, setClientId] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [showConverter, setShowConverter] = useState(false);
  const [globalFormat, setGlobalFormat] = useState<string>('');
  
  const supportedFormats = ['epub', 'mobi', 'azw3', 'pdf', 'txt'];

  useEffect(() => {
    // 建立 WebSocket 连接
    const ws = new WebSocket('ws://localhost:3002');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') {
        setClientId(data.clientId);
      } else if (data.type === 'progress') {
        setUploadedFiles(prev => prev.map(file => {
          if (file.status === 'converting') {
            return {
              ...file,
              progress: data.progress,
              status: data.progress === 100 ? 'completed' : 'converting'
            };
          }
          return file;
        }));
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  // 处理文件拖放
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  // 处理拖拽悬停
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理文件选择
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  // 统一处理文件
  const handleFiles = (files: File[]) => {
    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending' as const,
      progress: 0,
      targetFormat: globalFormat // 如果有全局格式，使用全局格式
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setShowConverter(true);
  };

  const handleFormatChange = (fileIndex: number, format: string) => {
    setUploadedFiles(prev => prev.map((file, index) => 
      index === fileIndex ? { ...file, targetFormat: format } : file
    ));
  };

  // 并行转换函数
  const convertFile = async (file: UploadedFile, index: number): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file.file);
    formData.append('targetFormat', file.targetFormat!);

    try {
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'converting', progress: 0 } : f
      ));

      const response = await fetch('http://localhost:3002/convert', {
        method: 'POST',
        headers: {
          'X-Client-ID': clientId,
        },
        mode: 'cors',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`转换失败: ${response.statusText}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { 
          ...f, 
          status: 'completed', 
          progress: 100,
          convertedUrl: url 
        } : f
      ));
    } catch (error) {
      console.error(`文件 ${file.file.name} 转换错误:`, error);
      setUploadedFiles(prev => prev.map((f, i) => 
        i === index ? { ...f, status: 'error', progress: 0 } : f
      ));
    }
  };

  // 并行处理所有文件
  const handleConvert = async () => {
    if (!uploadedFiles.every(file => file.targetFormat)) {
      alert('请为所有文件选择目标格式');
      return;
    }

    // 设置并行数量
    const maxParallel = 3; // 可以根据需要调整并行数
    const files = [...uploadedFiles];
    
    // 使用 async/await 和 Promise.all 进行并行处理
    while (files.length > 0) {
      const batch = files.splice(0, maxParallel);
      const promises = batch.map((file, i) => 
        convertFile(file, uploadedFiles.indexOf(file))
      );
      
      await Promise.all(promises);
    }
  };

  const handleDownload = (file: UploadedFile) => {
    if (file.convertedUrl) {
      const a = document.createElement('a');
      a.href = file.convertedUrl;
      a.download = `${file.file.name.split('.')[0]}.${file.targetFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // 处理全局格式变更
  const handleGlobalFormatChange = (format: string) => {
    setGlobalFormat(format);
    // 将所有待转换文件的格式更新为选择的格式
    setUploadedFiles(prev => prev.map(file => ({
      ...file,
      targetFormat: format
    })));
  };

  // 批量下载函数优化
  const handleDownloadAll = async () => {
    const completedFiles = uploadedFiles.filter(
      file => file.status === 'completed' && file.convertedUrl
    );

    if (completedFiles.length === 0) {
      alert('没有可下载的文件');
      return;
    }

    // 如果只有一个文件，直接下载
    if (completedFiles.length === 1) {
      handleDownload(completedFiles[0]);
      return;
    }

    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // 并行下载所有文件
      await Promise.all(
        completedFiles.map(async file => {
          const response = await fetch(file.convertedUrl!);
          const blob = await response.blob();
          const fileName = `${file.file.name.split('.')[0]}.${file.targetFormat}`;
          zip.file(fileName, blob);
        })
      );

      const content = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 5 }
      });

      const url = window.URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `converted_files_${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('批量下载错误:', error);
      alert('批量下载失败，请尝试单个下载');
    }
  };

  // 进度条组件
  const ProgressBar = ({ 
    progress, 
    status 
  }: { 
    progress: number, 
    status: 'pending' | 'converting' | 'completed' | 'error' 
  }) => {
    // 根据状态决定颜色
    const getBarColor = () => {
      switch (status) {
        case 'pending':
          return 'bg-gray-200';
        case 'converting':
          return 'bg-orange-500';
        case 'completed':
          return 'bg-green-500';
        case 'error':
          return 'bg-red-500';
        default:
          return 'bg-gray-200';
      }
    };

    // 获取状态文本
    const getStatusText = () => {
      switch (status) {
        case 'pending':
          return '等待转换';
        case 'converting':
          return `转换中 ${progress}%`;
        case 'completed':
          return '转换完成';
        case 'error':
          return '转换失败';
        default:
          return '未知状态';
      }
    };

    return (
      <div className="w-[200px]"> {/* 固定��度确保一致性 */}
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-sm font-medium ${
            status === 'error' ? 'text-red-600' : 'text-gray-700'
          }`}>
            {getStatusText()}
          </span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${getBarColor()}`}
            style={{ 
              width: `${status === 'pending' ? 0 : progress}%`,
            }}
          />
        </div>
      </div>
    );
  };

  // 文件组件
  const FileItem = ({ 
    file, 
    index, 
    onFormatChange 
  }: { 
    file: UploadedFile, 
    index: number,
    onFormatChange: (index: number, format: string) => void 
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
      <div className="flex items-center gap-4">
        <FileType className="h-6 w-6 text-gray-400" />
        <div>
          <p className="font-medium text-gray-900">{file.file.name}</p>
          <p className="text-sm text-gray-500">
            {(file.file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <ProgressBar progress={file.progress} status={file.status} />
        
        <div className="flex items-center gap-2">
          {file.status === 'completed' && (
            <button
              onClick={() => handleDownload(file)}
              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              下载
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* 导航条 */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo 和名称 */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <span className="font-bold text-xl text-gray-900">George Convert</span>
                <span className="ml-2 text-sm text-gray-500">电子书格式转换器</span>
              </div>
            </div>

            {/* 导航链接 */}
            <div className="flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                功能特点
              </a>
              <a href="#guide" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                使用指南
              </a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                关于我们
              </a>
              <a 
                href="https://github.com/aproof-go/george-convert" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                <span>GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-5xl mx-auto px-4 py-12">
        {/* 转换模块 */}
        {!showConverter ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center mb-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              电子书格式转换
            </h1>
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                拖拽文件到这里，或者点击选择文件
              </p>
              <p className="text-sm text-gray-500">
                支持 EPUB、MOBI、AZW3、PDF、TXT 等格式
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">统一输出格式：</span>
                <select
                  className="border rounded-lg px-4 py-2"
                  value={globalFormat}
                  onChange={(e) => handleGlobalFormatChange(e.target.value)}
                >
                  <option value="">选择格式</option>
                  {supportedFormats.map(format => (
                    <option key={format} value={format}>{format.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-4">
                <button 
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                  onClick={() => {
                    setShowConverter(false);
                    setUploadedFiles([]);
                    setGlobalFormat('');
                  }}
                >
                  取消
                </button>
                <button 
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  onClick={handleConvert}
                  disabled={uploadedFiles.some(f => f.status === 'converting')}
                >
                  开始转换
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {uploadedFiles.map((file, index) => (
                <div key={file.id} className="p-6 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <FileType className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{file.file.name}</p>
                        <p className="text-sm text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    
                    {file.status === 'completed' && (
                      <button
                        onClick={() => handleDownload(file)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 font-medium"
                      >
                        <Download className="h-4 w-4" />
                        下载
                      </button>
                    )}
                  </div>

                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-medium ${
                        file.status === 'error' ? 'text-red-600' : 'text-gray-700'
                      }`}>
                        {file.status === 'pending' && '等待转换'}
                        {file.status === 'converting' && `转换中 ${file.progress}%`}
                        {file.status === 'completed' && '转换完成'}
                        {file.status === 'error' && '转换失败'}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          file.status === 'pending' ? 'bg-gray-200' :
                          file.status === 'converting' ? 'bg-orange-500' :
                          file.status === 'completed' ? 'bg-green-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${file.status === 'pending' ? 0 : file.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {uploadedFiles.some(f => f.status === 'completed') && (
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleDownloadAll}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 font-medium"
                >
                  <Package className="h-4 w-4" />
                  打包下载全部文件
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 内容部分 */}
      <ContentSections />
    </div>
  )
}