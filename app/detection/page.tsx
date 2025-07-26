'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
// import ImageCompressor from '@/components/ImageCompressor'

export default function DetectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [needsCompression, setNeedsCompression] = useState(false)
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (file: File) => {
    setError(null)
    setCompressionInfo(null)
    setNeedsCompression(false)

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('只支持 JPEG、PNG、GIF、WebP 格式的图片')
      return
    }

    setOriginalFile(file)

    // 检查是否需要压缩
    if (file.size > 5 * 1024 * 1024) {
      setNeedsCompression(true)
      setSelectedFile(null) // 清空已选择的文件，等待压缩
    } else {
      setSelectedFile(file)
      setNeedsCompression(false)
    }

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleCompressed = (compressedFile: File, info: { originalSize: number; newSize: number }) => {
    setSelectedFile(compressedFile)
    setNeedsCompression(false)
    setCompressionInfo(
      `压缩完成：${formatFileSize(info.originalSize)} → ${formatFileSize(info.newSize)}`
    )
  }

  const handleCompressionError = (error: string) => {
    setError(error)
    setNeedsCompression(false)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const result = await response.json()

      if (result.taskId) {
        router.push(`/results?taskId=${result.taskId}`)
      } else {
        throw new Error('服务器响应异常')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  const resetFile = () => {
    setSelectedFile(null)
    setPreview(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              食品安全检测
            </h1>
            <p className="text-gray-600">
              上传食品包装图片，我们将为您分析配料的健康度
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            {!selectedFile ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-4xl mb-4">📷</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  选择或拖拽图片
                </h3>
                <p className="text-gray-600 mb-4">
                  支持 JPEG、PNG、GIF、WebP 格式<br/>
                  大于 5MB 的图片将自动压缩
                </p>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  选择文件
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* 压缩组件 - 暂时禁用 */}
                {needsCompression && originalFile && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-yellow-800">图片大于 5MB，需要压缩。压缩功能开发中...</p>
                  </div>
                )}

                <div className="relative">
                  <img
                    src={preview!}
                    alt="预览"
                    className="w-full max-h-64 object-contain rounded-lg"
                  />
                  <button
                    onClick={resetFile}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-600">
                        {formatFileSize(selectedFile.size)}
                      </p>
                      {compressionInfo && (
                        <p className="text-xs text-green-600 mt-1">
                          ✅ {compressionInfo}
                        </p>
                      )}
                    </div>
                    <div className="text-green-500">✓</div>
                  </div>
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? '正在分析...' : '开始分析'}
                </button>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
          </div>
          
          <div className="text-center mt-8">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-700 transition-colors"
            >
              ← 返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
