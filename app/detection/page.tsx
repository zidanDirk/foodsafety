'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// 任务状态类型定义
interface TaskStatus {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  processingStep?: string
  error?: string
  result?: {
    ocrData: {
      rawText: string
      extractedIngredients: any
      confidence: number
    }
    healthAnalysis: {
      overallScore: number
      ingredientScores: any
      analysisReport: string
      recommendations: string
    }
  }
}

export default function DetectionPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [currentTask, setCurrentTask] = useState<TaskStatus | null>(null)
  const [isPolling, setIsPolling] = useState(false)

  // 获取处理步骤的显示文本
  const getProcessingStepText = (step?: string) => {
    switch (step) {
      case 'ocr':
        return '正在识别图片文字...'
      case 'ocr_completed':
        return '文字识别完成，正在提取配料信息...'
      case 'ai_analysis':
        return '正在分析配料健康度...'
      case 'completed':
        return '分析完成'
      case 'error':
        return '处理出错'
      default:
        return '正在处理...'
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Check file size (max 8MB)
      if (file.size > 8 * 1024 * 1024) {
        alert('文件大小不能超过 8MB')
        return
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }
      
      setSelectedFile(file)
    }
  }

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    try {
      const response = await fetch(`/api/task-status?taskId=${taskId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch task status')
      }

      const taskStatus: TaskStatus = await response.json()
      setCurrentTask(taskStatus)

      // 如果任务完成或失败，停止轮询
      if (taskStatus.status === 'completed' || taskStatus.status === 'failed') {
        setIsPolling(false)
        setIsUploading(false)

        if (taskStatus.status === 'completed' && taskStatus.result) {
          // 任务完成，跳转到结果页面
          router.push(`/results?taskId=${taskId}`)
        }
      }
    } catch (error) {
      console.error('Failed to poll task status:', error)
    }
  }

  // 开始轮询
  useEffect(() => {
    if (isPolling && currentTask?.taskId) {
      const interval = setInterval(() => {
        pollTaskStatus(currentTask.taskId)
      }, 2000) // 每2秒轮询一次

      return () => clearInterval(interval)
    }
  }, [isPolling, currentTask?.taskId])

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // 创建FormData
      const formData = new FormData()
      formData.append('image', selectedFile)

      // 上传文件
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '上传失败')
      }

      const result = await response.json()

      // 设置当前任务并开始轮询
      setCurrentTask({
        taskId: result.taskId,
        status: 'pending',
        progress: 0
      })
      setIsPolling(true)

    } catch (error) {
      console.error('Upload failed:', error)
      alert(error instanceof Error ? error.message : '上传失败，请重试')
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              ← 返回首页
            </Link>
          </div>

          <div className="card p-8">
            <h1 className="text-3xl font-bold text-center mb-8">食品安全检测</h1>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  选择要检测的食品图片
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                      点击选择图片
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      支持 JPG、PNG、GIF 格式，最大 8MB
                    </span>
                  </label>
                </div>
              </div>

              {selectedFile && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {(isUploading || currentTask) && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>
                            {currentTask?.status === 'pending' && '等待处理中...'}
                            {currentTask?.status === 'processing' && getProcessingStepText(currentTask.processingStep)}
                            {currentTask?.status === 'completed' && '处理完成'}
                            {currentTask?.status === 'failed' && '处理失败'}
                            {!currentTask && '上传中...'}
                          </span>
                          <span>{currentTask?.progress || uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              currentTask?.status === 'failed' ? 'bg-red-600' :
                              currentTask?.status === 'completed' ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${currentTask?.progress || uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {currentTask?.status === 'failed' && currentTask.error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-sm">
                            <strong>错误：</strong>{currentTask.error}
                          </p>
                        </div>
                      )}

                      {currentTask?.status === 'completed' && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-green-800 text-sm">
                            检测完成！正在跳转到结果页面...
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleUpload}
                    disabled={isUploading || isPolling}
                    className="w-full btn-primary text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading || isPolling ? '检测中...' : '开始检测'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
