'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [targetFormat, setTargetFormat] = useState<string>('mobi')
  const [status, setStatus] = useState<string>('')
  const [error, setError] = useState<string>('')

  const handleUpload = async () => {
    if (!selectedFile) return

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('targetFormat', targetFormat)

    try {
      setStatus('uploading')
      setError('')
      
      const response = await fetch(`${API_URL}/api/convert/upload`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        // 下载转换后的文件
        window.location.href = `${API_URL}${data.downloadUrl}`
      } else {
        setStatus('error')
        setError(data.error || '转换失败')
      }
    } catch (error) {
      setStatus('error')
      setError('网络错误，请重试')
      console.error('上传失败:', error)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          电子书格式转换
        </h1>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          {/* 文件上传区域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept=".epub"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setSelectedFile(file)
                  setStatus('')
                  setError('')
                }
              }}
              className="hidden"
              id="fileInput"
            />
            
            {selectedFile ? (
              <div className="space-y-4">
                <p className="text-green-600 flex items-center justify-center">
                  <Upload className="w-5 h-5 mr-2" />
                  {selectedFile.name}
                </p>
                
                {/* 格式选择 */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    选择目标格式
                  </label>
                  <select
                    value={targetFormat}
                    onChange={(e) => setTargetFormat(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="mobi">MOBI</option>
                    <option value="azw3">AZW3</option>
                  </select>
                </div>

                {/* 转换按钮 */}
                <button
                  onClick={handleUpload}
                  disabled={status === 'uploading'}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {status === 'uploading' ? '转换中...' : '开始转换'}
                </button>
              </div>
            ) : (
              <label htmlFor="fileInput" className="cursor-pointer block">
                <div className="flex flex-col items-center">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    点击选择或拖放 EPUB 文件
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    支持的格式: EPUB
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* 状态显示 */}
          {status === 'success' && (
            <div className="mt-4">
              <p className="text-green-600">转换成功！</p>
              <p className="text-gray-500">转换后的文件已下载到本地。</p>
            </div>
          )}
          {status === 'error' && (
            <div className="mt-4">
              <p className="text-red-600">转换失败：{error}</p>
              <p className="text-gray-500">请重试或联系管理员。</p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}