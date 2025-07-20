import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set')
}

// 创建数据库连接
export const sql = neon(process.env.DATABASE_URL)

// 数据库类型定义
export interface DetectionTask {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  image_url?: string
  image_filename?: string
  image_size?: number
  created_at: Date
  updated_at: Date
  completed_at?: Date
  error_message?: string
  processing_step?: string
}

export interface OCRResult {
  id: string
  task_id: string
  raw_text?: string
  extracted_ingredients?: any
  confidence_score?: number
  created_at: Date
}

export interface HealthAnalysis {
  id: string
  task_id: string
  overall_score?: number
  ingredient_scores?: any
  analysis_report?: string
  recommendations?: string
  created_at: Date
}

// 数据库操作函数
export class DatabaseService {
  // 创建检测任务
  static async createTask(data: {
    image_filename?: string
    image_size?: number
    image_url?: string
  }): Promise<DetectionTask> {
    const result = await sql`
      INSERT INTO detection_tasks (image_filename, image_size, image_url)
      VALUES (${data.image_filename}, ${data.image_size}, ${data.image_url})
      RETURNING *
    `
    return result[0] as DetectionTask
  }

  // 获取任务信息
  static async getTask(taskId: string): Promise<DetectionTask | null> {
    const result = await sql`
      SELECT * FROM detection_tasks WHERE id = ${taskId}
    `
    return result[0] as DetectionTask || null
  }

  // 更新任务状态
  static async updateTaskStatus(
    taskId: string,
    status: DetectionTask['status'],
    progress?: number,
    processingStep?: string,
    errorMessage?: string
  ): Promise<void> {
    await sql`
      UPDATE detection_tasks
      SET status = ${status},
          progress = ${progress || 0},
          processing_step = ${processingStep || null},
          error_message = ${errorMessage || null},
          completed_at = ${status === 'completed' ? new Date() : null}
      WHERE id = ${taskId}
    `
  }

  // 保存OCR结果
  static async saveOCRResult(data: {
    task_id: string
    raw_text?: string
    extracted_ingredients?: any
    confidence_score?: number
  }): Promise<OCRResult> {
    try {
      const extractedIngredientsJson = data.extracted_ingredients ? JSON.stringify(data.extracted_ingredients) : null

      const result = await sql`
        INSERT INTO ocr_results (task_id, raw_text, extracted_ingredients, confidence_score)
        VALUES (${data.task_id}, ${data.raw_text}, ${extractedIngredientsJson}, ${data.confidence_score})
        RETURNING *
      `
      return result[0] as OCRResult
    } catch (error) {
      console.error('Failed to save OCR result:', error)
      throw new Error('Database operation failed: saveOCRResult')
    }
  }

  // 保存健康分析结果
  static async saveHealthAnalysis(data: {
    task_id: string
    overall_score?: number
    ingredient_scores?: any
    analysis_report?: string
    recommendations?: string
  }): Promise<HealthAnalysis> {
    try {
      const ingredientScoresJson = data.ingredient_scores ? JSON.stringify(data.ingredient_scores) : null

      const result = await sql`
        INSERT INTO health_analysis (task_id, overall_score, ingredient_scores, analysis_report, recommendations)
        VALUES (${data.task_id}, ${data.overall_score}, ${ingredientScoresJson}, ${data.analysis_report}, ${data.recommendations})
        RETURNING *
      `
      return result[0] as HealthAnalysis
    } catch (error) {
      console.error('Failed to save health analysis:', error)
      throw new Error('Database operation failed: saveHealthAnalysis')
    }
  }

  // 获取完整的任务结果
  static async getTaskWithResults(taskId: string) {
    const task = await this.getTask(taskId)
    if (!task) return null

    const ocrResult = await sql`
      SELECT * FROM ocr_results WHERE task_id = ${taskId} ORDER BY created_at DESC LIMIT 1
    `

    const healthAnalysis = await sql`
      SELECT * FROM health_analysis WHERE task_id = ${taskId} ORDER BY created_at DESC LIMIT 1
    `

    return {
      task,
      ocrResult: ocrResult[0] as OCRResult || null,
      healthAnalysis: healthAnalysis[0] as HealthAnalysis || null
    }
  }
}