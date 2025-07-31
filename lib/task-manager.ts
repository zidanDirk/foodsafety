// 异步任务处理器 - 整合OCR和AI分析
import { DatabaseManager, Task } from './database'
import { memoryStorage } from './memory-storage'
import { OCRService } from './ocr-service'
import { AIAnalysisService } from './ai-analysis-service'
import { connections } from '@/pages/api/ws'

// 检查是否使用数据库
let useDatabase = false

export class TaskProcessor {
  // 初始化存储方式
  static async initializeStorage(): Promise<boolean> {
    try {
      const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
      if (!databaseUrl) {
        console.warn('数据库未配置，使用内存存储')
        useDatabase = false
        return true
      }

      // 尝试连接数据库
      const isConnected = await DatabaseManager.checkConnection()
      if (isConnected) {
        useDatabase = true
        console.log('使用数据库存储')
        return true
      } else {
        console.warn('数据库连接失败，降级到内存存储')
        useDatabase = false
        return true
      }
    } catch (error) {
      console.error('存储初始化失败:', error)
      useDatabase = false
      return true // 降级到内存存储总是可用的
    }
  }

  // 创建任务
  static async createTask(taskId: string, fileInfo: any): Promise<Task | null> {
    try {
      // 确保存储已初始化
      if (useDatabase === undefined) {
        await this.initializeStorage()
      }

      if (useDatabase) {
        const task = await DatabaseManager.createTask(taskId, fileInfo)
        if (task) {
          console.log(`数据库 - 任务创建成功: ${taskId}`)
          return task
        } else {
          // 数据库失败，降级到内存存储
          console.warn('数据库创建任务失败，降级到内存存储')
          useDatabase = false
        }
      }

      // 使用内存存储
      const task = memoryStorage.createTask(taskId, fileInfo)
      return task
    } catch (error) {
      console.error(`创建任务失败: ${taskId}`, error)
      // 最后的降级方案
      try {
        return memoryStorage.createTask(taskId, fileInfo)
      } catch (fallbackError) {
        console.error('内存存储也失败了:', fallbackError)
        return null
      }
    }
  }

  // 更新任务状态
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      let task: Task | null = null
      
      if (useDatabase) {
        task = await DatabaseManager.updateTask(taskId, updates)
        if (task) {
          console.log(`数据库 - 任务更新: ${taskId}, 状态: ${task.status}, 进度: ${task.progress}%`)
        } else {
          // 降级到内存存储
          console.warn('数据库更新失败，尝试内存存储')
        }
      }

      // 如果数据库更新失败或未使用数据库，使用内存存储
      if (!task) {
        task = memoryStorage.updateTask(taskId, updates)
      }
      
      // 发送WebSocket更新
      if (task) {
        this.sendWebSocketUpdate(taskId, task)
      }
      
      return task
    } catch (error) {
      console.error(`更新任务失败: ${taskId}`, error)
      // 降级到内存存储
      try {
        const task = memoryStorage.updateTask(taskId, updates)
        // 发送WebSocket更新
        if (task) {
          this.sendWebSocketUpdate(taskId, task)
        }
        return task
      } catch (fallbackError) {
        console.error('内存存储更新也失败了:', fallbackError)
        return null
      }
    }
  }

  // 获取任务
  static async getTask(taskId: string): Promise<Task | null> {
    try {
      if (useDatabase) {
        const task = await DatabaseManager.getTask(taskId)
        if (task) {
          return task
        } else {
          // 尝试内存存储
          console.warn('数据库中未找到任务，尝试内存存储')
        }
      }

      // 使用内存存储
      return memoryStorage.getTask(taskId)
    } catch (error) {
      console.error(`获取任务失败: ${taskId}`, error)
      // 降级到内存存储
      try {
        return memoryStorage.getTask(taskId)
      } catch (fallbackError) {
        console.error('内存存储获取也失败了:', fallbackError)
        return null
      }
    }
  }

  // 异步处理图片 - 完整的OCR + AI分析流程
  static async processImageAsync(taskId: string, imageBase64: string): Promise<void> {
    try {
      console.log(`开始处理任务: ${taskId}`)

      // 步骤1: 更新状态为处理中
      await this.updateTask(taskId, {
        status: 'processing',
        progress: 10,
        processing_step: '准备处理图片'
      })

      // 步骤2: OCR文字识别
      await this.updateTask(taskId, {
        progress: 30,
        processing_step: 'OCR文字识别中'
      })

      const ocrResult = await OCRService.processImage(imageBase64)

      if (!ocrResult.success) {
        throw new Error('OCR识别失败: ' + (ocrResult.error || '未知错误'))
      }

      // 保存OCR结果
      await this.updateTask(taskId, {
        progress: 60,
        processing_step: 'OCR识别完成',
        ocr_result: ocrResult
      })

      // 检查是否提取到配料
      if (!ocrResult.extractedIngredients.hasIngredients ||
          ocrResult.extractedIngredients.ingredients.length === 0) {
        throw new Error('未能从图片中识别到配料信息，请确保图片清晰且包含配料表')
      }

      // 步骤3: AI健康度分析
      await this.updateTask(taskId, {
        progress: 80,
        processing_step: 'AI健康度分析中'
      })

      const aiResult = await AIAnalysisService.analyzeIngredients(
        ocrResult.rawText
      )

      if (!aiResult.success) {
        throw new Error('AI分析失败: ' + (aiResult.error || '未知错误'))
      }

      // 步骤4: 完成任务
      await this.updateTask(taskId, {
        status: 'completed',
        progress: 100,
        processing_step: '分析完成',
        ai_result: aiResult.data
      })

      console.log(`任务处理完成: ${taskId}`)

    } catch (error) {
      console.error(`任务处理失败: ${taskId}`, error)

      await this.updateTask(taskId, {
        status: 'failed',
        progress: 0,
        processing_step: '处理失败',
        error_message: error instanceof Error ? error.message : '处理失败'
      })
    }
  }

  // 获取任务结果（用于API响应）
  static async getTaskResult(taskId: string) {
    const task = await this.getTask(taskId)

    if (!task) {
      return null
    }

    const response: any = {
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      processingStep: task.processing_step,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    }

    // 如果任务失败，包含错误信息
    if (task.status === 'failed' && task.error_message) {
      response.error = task.error_message
    }

    // 如果任务完成，包含完整结果
    if (task.status === 'completed' && task.ocr_result && task.ai_result) {
      response.completedAt = task.completed_at
      response.result = {
        ocrData: task.ocr_result,
        healthAnalysis: task.ai_result
      }
    }

    return response
  }

  // 清理过期任务
  static async cleanupOldTasks(): Promise<number> {
    try {
      return await DatabaseManager.cleanupOldTasks()
    } catch (error) {
      console.error('清理过期任务失败:', error)
      return 0
    }
  }

  // 获取任务统计
  static async getTaskStats() {
    try {
      return await DatabaseManager.getTaskStats()
    } catch (error) {
      console.error('获取任务统计失败:', error)
      return {}
    }
  }
  
  // 发送WebSocket更新
  private static sendWebSocketUpdate(taskId: string, task: Task) {
    try {
      const connection = connections.get(taskId)
      if (connection && connection.readyState === connection.OPEN) {
        const update = {
          type: 'taskUpdate',
          taskId: task.id,
          status: task.status,
          progress: task.progress,
          processingStep: task.processing_step,
          updatedAt: task.updated_at
        }
        
        connection.send(JSON.stringify(update))
      }
    } catch (error) {
      console.error('发送WebSocket更新失败:', error)
    }
  }
}
