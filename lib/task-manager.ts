// 异步任务处理器 - 整合OCR和AI分析
import { DatabaseManager, Task } from './database'
import { OCRService } from './ocr-service'
import { AIAnalysisService } from './ai-analysis-service'

export class TaskProcessor {
  // 创建任务
  static async createTask(taskId: string, fileInfo: any): Promise<Task | null> {
    try {
      const task = await DatabaseManager.createTask(taskId, fileInfo)
      if (task) {
        console.log(`任务创建成功: ${taskId}`)
      }
      return task
    } catch (error) {
      console.error(`创建任务失败: ${taskId}`, error)
      return null
    }
  }

  // 更新任务状态
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const task = await DatabaseManager.updateTask(taskId, updates)
      if (task) {
        console.log(`任务更新: ${taskId}, 状态: ${task.status}, 进度: ${task.progress}%`)
      }
      return task
    } catch (error) {
      console.error(`更新任务失败: ${taskId}`, error)
      return null
    }
  }

  // 获取任务
  static async getTask(taskId: string): Promise<Task | null> {
    try {
      return await DatabaseManager.getTask(taskId)
    } catch (error) {
      console.error(`获取任务失败: ${taskId}`, error)
      return null
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
        ocrResult.extractedIngredients.ingredients
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
}
