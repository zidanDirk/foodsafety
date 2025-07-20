const { SimpleOCRService } = require('./simple-ocr.js')
const { SimpleAIAnalysisService } = require('./simple-ai-analysis.js')

// 全局任务存储，避免模块重载时丢失
if (!global.taskStorage) {
  global.taskStorage = new Map()
}

// 简化的任务处理器
class SimpleTaskProcessor {
  static get tasks() {
    return global.taskStorage
  }
  
  // 创建新任务
  static createTask(taskId, fileInfo) {
    const task = {
      id: taskId,
      status: 'pending',
      progress: 0,
      processingStep: 'initializing',
      fileInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.tasks.set(taskId, task)
    console.log('Task created in processor:', taskId, 'Total tasks:', this.tasks.size)
    return task
  }
  
  // 更新任务状态
  static updateTask(taskId, updates) {
    const task = this.tasks.get(taskId)
    if (task) {
      Object.assign(task, updates, { updatedAt: new Date().toISOString() })
      this.tasks.set(taskId, task)
    }
    return task
  }
  
  // 获取任务状态
  static getTask(taskId) {
    const task = this.tasks.get(taskId)
    console.log('Getting task:', taskId, 'Found:', task ? 'yes' : 'no')
    return task
  }
  
  // 处理任务
  static async processTask(taskId, imagePath) {
    try {
      // 更新状态：开始OCR处理
      this.updateTask(taskId, {
        status: 'processing',
        progress: 10,
        processingStep: 'ocr_processing'
      })
      
      // 1. OCR文字识别
      const ocrResult = await SimpleOCRService.processImage(imagePath)
      console.log(`ocrResult`, ocrResult)
      if (!ocrResult.success) {
        this.updateTask(taskId, {
          status: 'failed',
          progress: 0,
          processingStep: 'failed',
          error: ocrResult.error
        })
        return
      }
      
      // 更新状态：OCR完成
      this.updateTask(taskId, {
        progress: 50,
        processingStep: 'ocr_completed',
        ocrData: ocrResult.data
      })
      
      // 2. AI健康度分析
      this.updateTask(taskId, {
        progress: 60,
        processingStep: 'ai_analysis'
      })

      console.log(`ocrResult.data.extractedIngredients.ingredients`, ocrResult.data.extractedIngredients.ingredients)

      const aiResult = await SimpleAIAnalysisService.analyzeIngredients(
        ocrResult.data.extractedIngredients.ingredients
      )

      console.log('AI Analysis result:', JSON.stringify(aiResult, null, 2))

      // 检查AI分析结果
      if (!aiResult.success) {
        console.error('AI analysis failed:', aiResult.error)
        // 即使AI分析失败，也尝试使用降级数据
        if (!aiResult.data) {
          this.updateTask(taskId, {
            status: 'failed',
            progress: 0,
            processingStep: 'failed',
            error: aiResult.error || 'AI分析失败且无降级数据'
          })
          return
        }
      }

      // 确保有健康分析数据
      const healthAnalysisData = aiResult.data || {}
      console.log('Health analysis data:', JSON.stringify(healthAnalysisData, null, 2))

      // 更新状态：完成
      this.updateTask(taskId, {
        status: 'completed',
        progress: 100,
        processingStep: 'completed',
        result: {
          ocrData: ocrResult.data,
          healthAnalysis: healthAnalysisData
        },
        completedAt: new Date().toISOString()
      })
      
    } catch (error) {
      console.error('Task processing failed:', error)
      this.updateTask(taskId, {
        status: 'failed',
        progress: 0,
        processingStep: 'failed',
        error: error.message || '处理失败'
      })
    }
  }
  
  // 启动异步任务处理
  static async startAsyncProcessing(taskId, imagePath) {
    // 不等待处理完成，立即返回
    this.processTask(taskId, imagePath).catch(error => {
      console.error('Async task processing failed:', error)
    })
  }
}

module.exports = { SimpleTaskProcessor }
