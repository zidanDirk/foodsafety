import { DatabaseService } from './database'
import { OCRService } from './ocr-service'
import { AIAnalysisService } from './ai-analysis'
import fs from 'fs/promises'

// 任务处理器 - 统一管理异步任务处理流程
export class TaskProcessor {

  // 处理单个任务的完整流程
  static async processTask(taskId: string, imagePath: string): Promise<void> {
    try {
      console.log(`Starting task processing for task ${taskId}`)

      // 步骤1: 开始OCR处理
      await this.updateProgress(taskId, 'processing', 20, 'ocr')

      const ocrResult = await this.performOCR(imagePath)

      console.log(`ocrResult`, ocrResult)

      // 步骤2: OCR完成，保存结果
      await this.updateProgress(taskId, 'processing', 60, 'ocr_completed')

      await DatabaseService.saveOCRResult({
        task_id: taskId,
        raw_text: ocrResult.rawText,
        extracted_ingredients: ocrResult.extractedIngredients,
        confidence_score: ocrResult.ocrConfidence
      })

      // 步骤3: 检查OCR结果并决定下一步
      if (!ocrResult.success || !ocrResult.extractedIngredients.hasIngredients) {
        await this.handleNoIngredientsFound(taskId)
      } else {
        await this.performHealthAnalysis(taskId, ocrResult.extractedIngredients.ingredients)
      }

      // 步骤4: 清理临时文件
      await this.cleanupTempFile(imagePath)

      console.log(`Task ${taskId} completed successfully`)

    } catch (error) {
      console.error(`Task ${taskId} failed:`, error)
      await this.handleTaskFailure(taskId, error, imagePath)
    }
  }

  // 执行OCR识别
  private static async performOCR(imagePath: string) {
    try {
      const imageBuffer = await fs.readFile(imagePath)
      return await OCRService.processImage(imageBuffer)
    } catch (error) {
      console.error('OCR processing failed:', error)
      throw new Error(`OCR识别失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  // 处理未找到配料的情况
  private static async handleNoIngredientsFound(taskId: string) {
    await DatabaseService.saveHealthAnalysis({
      task_id: taskId,
      overall_score: 0,
      ingredient_scores: {
        message: '未检测到配料信息',
        suggestion: '请确保图片清晰且包含配料表内容'
      },
      analysis_report: '图片中未能识别到配料表信息。这可能是因为：\n1. 图片不够清晰\n2. 图片中没有配料表\n3. 配料表文字过小或模糊\n\n建议重新拍摄包含清晰配料表的图片。',
      recommendations: '1. 确保图片光线充足\n2. 保持相机稳定，避免模糊\n3. 确保配料表文字清晰可见\n4. 可以尝试放大配料表部分重新拍摄'
    })

    await this.updateProgress(taskId, 'completed', 100, 'completed')
  }

  // 执行健康度分析
  private static async performHealthAnalysis(taskId: string, ingredients: Array<{ name: string; position: number }>) {
    try {
      // 更新进度：开始AI分析
      await this.updateProgress(taskId, 'processing', 80, 'ai_analysis')

      // 执行AI分析
      const analysisResult = await AIAnalysisService.analyzeIngredients(ingredients)

      // 保存分析结果
      await DatabaseService.saveHealthAnalysis({
        task_id: taskId,
        overall_score: analysisResult.overallScore,
        ingredient_scores: analysisResult,
        analysis_report: analysisResult.analysisReport,
        recommendations: analysisResult.recommendations
      })

      // 完成任务
      await this.updateProgress(taskId, 'completed', 100, 'completed')

    } catch (aiError) {
      console.error('AI analysis failed:', aiError)

      // AI分析失败时的降级处理
      await this.handleAIAnalysisFailure(taskId, ingredients)
    }
  }

  // 处理AI分析失败的情况
  private static async handleAIAnalysisFailure(taskId: string, ingredients: Array<{ name: string; position: number }>) {
    await DatabaseService.saveHealthAnalysis({
      task_id: taskId,
      overall_score: 5, // 中性评分
      ingredient_scores: {
        scores: ingredients.map(ing => ({
          ingredient: ing.name,
          score: 5,
          reason: 'AI分析服务暂时不可用，无法提供详细评分',
          category: '待分析',
          healthImpact: '需要人工分析'
        })),
        note: 'AI分析服务暂时不可用'
      },
      analysis_report: `成功识别到 ${ingredients.length} 种配料：${ingredients.map(ing => ing.name).join('、')}。\n\n由于AI分析服务暂时不可用，无法提供详细的健康度评分。建议咨询专业营养师获取准确的健康评估。`,
      recommendations: '1. 咨询专业营养师获取详细的健康建议\n2. 查阅相关营养资料了解各配料的健康影响\n3. 注意配料表中的添加剂和防腐剂\n4. 稍后重试获取AI分析结果'
    })

    await this.updateProgress(taskId, 'completed', 100, 'completed')
  }

  // 更新任务进度
  private static async updateProgress(
    taskId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    progress: number,
    step: string
  ) {
    await DatabaseService.updateTaskStatus(taskId, status, progress, step)
  }

  // 清理临时文件
  private static async cleanupTempFile(imagePath: string) {
    try {
      await fs.unlink(imagePath)
      console.log(`Cleaned up temp file: ${imagePath}`)
    } catch (cleanupError) {
      console.error('Failed to cleanup temp file:', cleanupError)
      // 清理失败不应该影响主流程
    }
  }

  // 处理任务失败
  private static async handleTaskFailure(taskId: string, error: any, imagePath: string) {
    const errorMessage = error.message || '未知错误'

    await DatabaseService.updateTaskStatus(
      taskId,
      'failed',
      0,
      'error',
      errorMessage
    )

    // 尝试清理临时文件
    await this.cleanupTempFile(imagePath)
  }

  // 获取任务处理统计信息
  static async getProcessingStats() {
    // 这个方法可以用于监控和调试
    try {
      // 使用DatabaseService的方法而不是直接访问sql
      // 这里简化实现，避免直接使用sql模板字符串
      return []
    } catch (error) {
      console.error('Failed to get processing stats:', error)
      return []
    }
  }
}