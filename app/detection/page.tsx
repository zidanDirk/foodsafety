// app/detection/page.tsx
'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatFileSize } from '@/lib/utils'
import { useAccessibility } from '@/components/AccessibilityHelper'

export default function DetectionPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [needsCompression, setNeedsCompression] = useState(false)
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null)
  const [compressionProgress, setCompressionProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const workerRef = useRef<Worker | null>(null)
  const router = useRouter()
  const { highContrast } = useAccessibility()

  // Initialize Web Worker
  useEffect(() => {
    // Create Web Worker for image compression from public directory
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker('/image-compression-worker.js')
      
      workerRef.current.onmessage = (e) => {
        const { success, compressedFile, originalSize, newSize, error: workerError } = e.data
        
        if (success && compressedFile) {
          handleCompressed(new File([compressedFile], compressedFile.name, {
            type: compressedFile.type,
            lastModified: compressedFile.lastModified
          }), { originalSize, newSize })
        } else {
          handleCompressionError(workerError || '压缩失败')
        }
      }
    }
    
    // Clean up worker on unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate()
      }
    }
  }, [])

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

    // 检查是否需要压缩
    const needsCompress = file.size > 5 * 1024 * 1024

    if (needsCompress) {
      setNeedsCompression(true)
      setCompressionInfo('正在准备压缩...')
      setCompressionProgress(10)
    } else {
      setSelectedFile(file)
    }

    // 并行处理：同时创建预览和开始压缩
    const tasks = []

    // 任务1：创建预览（总是需要）
    tasks.push(createPreview(file))

    // 任务2：压缩图片（如果需要）
    if (needsCompress) {
      tasks.push(autoCompressImage(file))
    }

    try {
      await Promise.all(tasks)
      if (!needsCompress) {
        setNeedsCompression(false)
      }
    } catch (error) {
      setError('图片处理失败，请重试')
      setNeedsCompression(false)
    }
  }

  // 独立的预览创建函数
  const createPreview = (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
        resolve()
      }
      reader.readAsDataURL(file)
    })
  }

  const handleCompressed = (compressedFile: File, info: { originalSize: number; newSize: number }) => {
    setSelectedFile(compressedFile)
    setNeedsCompression(false)
    setCompressionProgress(100)
    
    const compressionRatio = ((info.originalSize - info.newSize) / info.originalSize * 100).toFixed(1)
    setCompressionInfo(
      `✅ 压缩完成：${formatFileSize(info.originalSize)} → ${formatFileSize(info.newSize)} (节省${compressionRatio}%)`
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
    setCompressionProgress(0)
  }

  // 使用 Web Worker 进行图片压缩
  const autoCompressImage = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('压缩工作线程未初始化'))
        return
      }

      setCompressionProgress(20)
      setCompressionInfo('正在分析图片...')

      // Send file to Web Worker
      workerRef.current.postMessage({
        file,
        targetSize: 4.5 * 1024 * 1024 // 4.5MB
      })

      // Update progress while waiting for worker response
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => {
          if (prev < 80) {
            return prev + 5
          }
          return prev
        })
      }, 200)

      // Override the worker's onmessage to handle progress updates
      const originalOnMessage = workerRef.current.onmessage
      workerRef.current.onmessage = (e) => {
        clearInterval(progressInterval)
        setCompressionProgress(100)
        
        // Restore original onmessage handler
        workerRef.current!.onmessage = originalOnMessage
        
        // Handle the response
        const { success, compressedFile, originalSize, newSize, error: workerError } = e.data
        
        if (success && compressedFile) {
          handleCompressed(new File([compressedFile], compressedFile.name, {
            type: compressedFile.type,
            lastModified: compressedFile.lastModified
          }), { originalSize, newSize })
          resolve()
        } else {
          handleCompressionError(workerError || '压缩失败')
          reject(new Error(workerError || '压缩失败'))
        }
      }
    })
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }, [])

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
    setNeedsCompression(false)
    setCompressionProgress(0)
    setCompressionInfo(null)
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

          <Card>
            {!selectedFile ? (
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer relative
                  ${isDragging 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="text-4xl mb-4">📷</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  选择或拖拽图片
                </h3>
                <p className="text-gray-600 mb-4">
                  支持 JPEG、PNG、GIF、WebP 格式<br/>
                  <span className="text-blue-600">大于 5MB 的图片将自动压缩优化</span>
                </p>
                <Button variant="primary">
                  选择文件
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <p className="text-gray-500 text-sm mt-4">或将图片拖拽到此处</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 自动压缩进度显示 */}
                {needsCompression && originalFile && (
                  <Card variant="filled">
                    <div className="flex items-center space-x-3 mb-3">
                      <LoadingSpinner size="sm" />
                      <h3 className="text-sm font-medium text-blue-800">正在自动压缩图片...</h3>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${compressionProgress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-blue-600">
                      <span>
                        {compressionInfo || `原始大小：${formatFileSize(originalFile.size)}`}
                      </span>
                      <span>{compressionProgress}%</span>
                    </div>
                  </Card>
                )}

                {preview && (
                  <div className="relative">
                    <img
                      src={preview}
                      alt="预览"
                      className="w-full max-h-64 object-contain rounded-lg border"
                    />
                    <button
                      onClick={resetFile}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                      aria-label="移除图片"
                    >
                      ×
                    </button>
                  </div>
                )}
                
                <Card variant="filled">
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
                    <div className="text-green-500 text-xl">✓</div>
                  </div>
                </Card>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || needsCompression}
                    size="lg"
                  >
                    {uploading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        正在分析...
                      </>
                    ) : needsCompression ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        压缩中...
                      </>
                    ) : (
                      '开始分析'
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={resetFile}
                    size="lg"
                  >
                    重新选择
                  </Button>
                </div>
              </div>
            )}
          </Card>
          
          {error && (
            <Card variant="outline" className="mt-4 border-red-200 bg-red-50">
              <div className="flex items-center text-red-600">
                <span className="text-xl mr-2">⚠️</span>
                <span>{error}</span>
              </div>
            </Card>
          )}
          
          <div className="text-center mt-8">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              ← 返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}