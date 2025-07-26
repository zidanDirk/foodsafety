// 图片处理工具 - 客户端压缩
export interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

export class ImageUtils {
  // 压缩图片文件
  static async compressImage(file: File, options: CompressOptions = {}): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      maxSizeKB = 4 * 1024 // 4MB，留一些余量
    } = options

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        try {
          // 计算新的尺寸
          const { width, height } = ImageUtils.calculateNewDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          )

          canvas.width = width
          canvas.height = height

          if (!ctx) {
            throw new Error('无法获取 Canvas 上下文')
          }

          // 绘制压缩后的图片
          ctx.drawImage(img, 0, 0, width, height)

          // 转换为 Blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('图片压缩失败'))
                return
              }

              // 检查压缩后的大小
              if (blob.size > maxSizeKB * 1024) {
                // 如果还是太大，降低质量重试
                const newQuality = Math.max(0.1, quality * 0.7)
                if (newQuality < quality) {
                  ImageUtils.compressImage(file, { ...options, quality: newQuality })
                    .then(resolve)
                    .catch(reject)
                  return
                }
              }

              // 创建新的 File 对象
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              })

              resolve(compressedFile)
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

      // 加载图片
      img.src = URL.createObjectURL(file)
    })
  }

  // 计算新的图片尺寸
  static calculateNewDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight }

    // 按比例缩放
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

  // 获取图片信息
  static async getImageInfo(file: File): Promise<{
    width: number
    height: number
    size: number
    type: string
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          size: file.size,
          type: file.type
        })
      }

      img.onerror = () => {
        reject(new Error('无法读取图片信息'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // 格式化文件大小
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // 检查是否需要压缩
  static needsCompression(file: File, maxSizeKB: number = 5 * 1024): boolean {
    return file.size > maxSizeKB * 1024
  }

  // 自动压缩（如果需要）
  static async autoCompress(file: File): Promise<{ file: File; compressed: boolean; originalSize: number; newSize: number }> {
    const originalSize = file.size
    const maxSizeKB = 4.5 * 1024 // 4.5MB，留一些余量

    if (!this.needsCompression(file, maxSizeKB)) {
      return {
        file,
        compressed: false,
        originalSize,
        newSize: originalSize
      }
    }

    try {
      // 根据文件大小选择不同的压缩策略
      let quality = 0.8
      let maxWidth = 1920
      let maxHeight = 1080

      if (file.size > 20 * 1024 * 1024) { // 大于20MB
        quality = 0.5
        maxWidth = 1280
        maxHeight = 720
      } else if (file.size > 10 * 1024 * 1024) { // 大于10MB
        quality = 0.6
        maxWidth = 1600
        maxHeight = 900
      }

      const compressedFile = await this.compressImage(file, {
        maxWidth,
        maxHeight,
        quality,
        maxSizeKB
      })

      return {
        file: compressedFile,
        compressed: true,
        originalSize,
        newSize: compressedFile.size
      }
    } catch (error) {
      console.error('图片压缩失败:', error)
      // 压缩失败时返回原文件
      return {
        file,
        compressed: false,
        originalSize,
        newSize: originalSize
      }
    }
  }
}
