'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import ImageCompressor from '@/components/ImageCompressor'

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

  const handleFileSelect = async (file: File) => {
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

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // 检查是否需要压缩并自动处理
    if (file.size > 5 * 1024 * 1024) {
      setNeedsCompression(true)
      setCompressionInfo('图片较大，正在自动压缩...')

      try {
        // 自动开始压缩
        await autoCompressImage(file)
      } catch (error) {
        setError('图片压缩失败，请重试')
        setNeedsCompression(false)
      }
    } else {
      setSelectedFile(file)
      setNeedsCompression(false)
    }
  }

  const handleCompressed = (compressedFile: File, info: { originalSize: number; newSize: number }) => {
    setSelectedFile(compressedFile)
    setNeedsCompression(false)
    setCompressionInfo(
      `压缩完成：${formatFileSize(info.originalSize)} → ${formatFileSize(info.newSize)}`
    )

    // 更新预览
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(compressedFile)
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

  // 自动压缩图片函数（递归压缩直到满足大小要求）
  const autoCompressImage = async (file: File, quality: number = 0.8): Promise<void> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        try {
          // 根据文件大小动态调整尺寸
          let maxWidth = 1600
          let maxHeight = 1200

          if (file.size > 20 * 1024 * 1024) { // 大于20MB
            maxWidth = 1280
            maxHeight = 720
          } else if (file.size > 10 * 1024 * 1024) { // 大于10MB
            maxWidth = 1400
            maxHeight = 900
          }

          // 计算新尺寸
          const { width, height } = calculateNewDimensions(img.width, img.height, maxWidth, maxHeight)

          canvas.width = width
          canvas.height = height

          if (!ctx) {
            throw new Error('无法获取 Canvas 上下文')
          }

          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height)

          // 转换为 Blob
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('图片压缩失败'))
                return
              }

              // 检查压缩后的大小
              if (blob.size > 4.5 * 1024 * 1024 && quality > 0.3) {
                // 如果还是太大且质量还可以降低，递归压缩
                setCompressionInfo(`正在进一步压缩... (当前: ${formatFileSize(blob.size)})`)
                try {
                  await autoCompressImage(file, quality * 0.7)
                  resolve()
                } catch (error) {
                  reject(error)
                }
                return
              }

              // 创建新的 File 对象
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })

              // 更新状态
              setSelectedFile(compressedFile)
              setNeedsCompression(false)
              setCompressionInfo(
                `✅ 自动压缩完成：${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`
              )

              // 更新预览
              const reader = new FileReader()
              reader.onload = (e) => {
                setPreview(e.target?.result as string)
              }
              reader.readAsDataURL(compressedFile)

              resolve()
            },
            file.type,
            quality
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // 计算新的图片尺寸
  const calculateNewDimensions = (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number = 1600,
    maxHeight: number = 1200
  ) => {
    let width = originalWidth
    let height = originalHeight

    if (width > maxWidth) {
      height = (height * maxWidth) / width
      width = maxWidth
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height
      height = maxHeight
    }

    return { width: Math.round(width), height: Math.round(height) }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    // 检查文件大小是否符合要求
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('文件大小超过 5MB，请先压缩图片')
      return
    }

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
                  <span className="text-blue-600">大于 5MB 的图片将自动压缩优化</span>
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
                {/* 自动压缩进度显示 */}
                {needsCompression && originalFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-800">正在自动压缩图片...</h3>
                        <p className="text-xs text-blue-600 mt-1">
                          原始大小：{formatFileSize(originalFile.size)}，正在优化到 5MB 以下
                        </p>
                      </div>
                    </div>
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
                  disabled={uploading || needsCompression}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {uploading ? '正在分析...' : needsCompression ? '请先压缩图片' : '开始分析'}
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
