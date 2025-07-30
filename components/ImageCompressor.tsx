'use client'

import { useState, useRef } from 'react'

interface ImageCompressorProps {
  file: File
  onCompressed: (compressedFile: File, info: { originalSize: number; newSize: number }) => void
  onError: (error: string) => void
}

export default function ImageCompressor({ file, onCompressed, onError }: ImageCompressorProps) {
  const [compressing, setCompressing] = useState(false)
  const [progress, setProgress] = useState(0)
  const compressionCancelled = useRef(false)

  const compressImage = async () => {
    if (file.size <= 5 * 1024 * 1024) {
      // 文件已经小于5MB，无需压缩
      onCompressed(file, { originalSize: file.size, newSize: file.size })
      return
    }

    compressionCancelled.current = false
    setCompressing(true)
    setProgress(10)

    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('无法获取 Canvas 上下文')
      }
      
      const img = new Image()

      img.onload = () => {
        if (compressionCancelled.current) return
        
        try {
          setProgress(30)

          // 计算新尺寸
          let { width, height } = calculateNewDimensions(img.width, img.height)
          
          canvas.width = width
          canvas.height = height

          setProgress(50)

          // 绘制图片
          ctx.drawImage(img, 0, 0, width, height)

          setProgress(70)

          // 转换为 Blob，使用较低的质量
          canvas.toBlob(
            (blob) => {
              if (compressionCancelled.current) return
              
              if (!blob) {
                onError('图片压缩失败')
                return
              }

              setProgress(90)

              // 创建新的 File 对象
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })

              setProgress(100)
              setCompressing(false)

              onCompressed(compressedFile, {
                originalSize: file.size,
                newSize: compressedFile.size
              })
            },
            file.type,
            0.7 // 70% 质量
          )
        } catch (error) {
          setCompressing(false)
          onError('图片处理失败')
        }
      }

      img.onerror = () => {
        if (!compressionCancelled.current) {
          setCompressing(false)
          onError('图片加载失败')
        }
      }

      setProgress(20)
      img.src = URL.createObjectURL(file)
    } catch (error) {
      setCompressing(false)
      onError('图片压缩失败')
    }
  }

  const calculateNewDimensions = (originalWidth: number, originalHeight: number) => {
    const maxWidth = 1920
    const maxHeight = 1080
    
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const cancelCompression = () => {
    compressionCancelled.current = true
    setCompressing(false)
  }

  if (!compressing) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-yellow-800">图片需要压缩</h3>
            <p className="text-sm text-yellow-700">
              当前大小：{formatFileSize(file.size)}，需要压缩到 5MB 以下
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={compressImage}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
            >
              开始压缩
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center space-x-3 mb-3">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <h3 className="text-sm font-medium text-blue-800">正在压缩图片...</h3>
      </div>
      
      <div className="w-full bg-blue-200 rounded-full h-2.5 mb-2">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-blue-600 mb-3">
        <span>{formatFileSize(file.size)} → {formatFileSize(file.size * (1 - progress/100))}</span>
        <span>{progress}%</span>
      </div>
      
      <button
        onClick={cancelCompression}
        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
      >
        取消压缩
      </button>
    </div>
  )
}
