// 创建一个统一的下载按钮组件
const DownloadButton = ({ 
  onClick, 
  children, 
  className = '' 
}: { 
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`
      inline-flex items-center justify-center
      w-[120px] h-[36px]  // 统一固定宽高
      bg-green-500 hover:bg-green-600
      text-white text-sm font-medium
      rounded-lg transition-colors
      gap-2
      ${className}
    `}
  >
    {children}
  </button>
);

// 在文件列表中使用
const FileItem = ({ file }: { file: UploadedFile }) => (
  <div className="p-6 border rounded-lg bg-gray-50">
    {/* ... 其他内容 ... */}
    
    {file.status === 'completed' && (
      <DownloadButton onClick={() => handleDownload(file)}>
        <Download className="w-4 h-4" />
        <span>下载</span>
      </DownloadButton>
    )}
  </div>
);

// 批量下载按钮
const BatchDownloadButton = () => (
  <DownloadButton 
    onClick={handleDownloadAll}
    className="mx-auto mt-6" // 额外的定位样式
  >
    <Package className="w-4 h-4" />
    <span>打包下载</span>
  </DownloadButton>
);
