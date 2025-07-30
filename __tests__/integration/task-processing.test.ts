import { mockTasks, mockOCRResults, mockAIResults } from '../test-utils'
import { TaskProcessor } from '../../lib/task-manager'
import { DatabaseManager } from '../../lib/database'
import { memoryStorage } from '../../lib/memory-storage'
import { OCRService } from '../../lib/ocr-service'
import { AIAnalysisService } from '../../lib/ai-analysis-service'

// 模拟服务
jest.mock('../../lib/ocr-service', () => ({
  OCRService: {
    processImage: jest.fn(),
  },
}))

jest.mock('../../lib/ai-analysis-service', () => ({
  AIAnalysisService: {
    analyzeIngredients: jest.fn(),
  },
}))

describe('任务处理集成测试', () => {
  const taskId = 'integration-test-task'
  const imageBase64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBAQE'

  beforeEach(() => {
    jest.clearAllMocks()
    // 清理内存存储
    memoryStorage.clear()
  })

  it('应该成功完成整个任务处理流程', async () => {
    // 模拟服务响应
    ;(OCRService.processImage as jest.Mock).mockResolvedValue(mockOCRResults.success)
    ;(AIAnalysisService.analyzeIngredients as jest.Mock).mockResolvedValue(mockAIResults.success)

    // 创建任务
    const task = await TaskProcessor.createTask(taskId, {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
    })

    expect(task).toEqual(expect.objectContaining(mockTasks.pendingTask))

    // 处理图片
    await TaskProcessor.processImageAsync(taskId, imageBase64)

    // 获取更新后的任务
    const updatedTask = await TaskProcessor.getTask(taskId)

    expect(updatedTask).toEqual(
      expect.objectContaining({
        id: taskId,
        status: 'completed',
        progress: 100,
        processing_step: '分析完成',
      })
    )

    expect(updatedTask?.ocr_result).toEqual(mockOCRResults.success)
    expect(updatedTask?.ai_result).toEqual(mockAIResults.success.data)
  })

  it('应该在OCR失败时正确处理错误', async () => {
    // 模拟OCR失败
    ;(OCRService.processImage as jest.Mock).mockResolvedValue(mockOCRResults.failure)

    // 创建任务
    await TaskProcessor.createTask(taskId, {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
    })

    // 处理图片
    await TaskProcessor.processImageAsync(taskId, imageBase64)

    // 获取更新后的任务
    const updatedTask = await TaskProcessor.getTask(taskId)

    expect(updatedTask).toEqual(
      expect.objectContaining({
        id: taskId,
        status: 'failed',
        progress: 0,
        processing_step: '处理失败',
        error_message: 'OCR识别失败: OCR识别失败：图片不清晰',
      })
    )
  })

  it('应该在AI分析失败时正确处理错误', async () => {
    // 模拟OCR成功但AI分析失败
    ;(OCRService.processImage as jest.Mock).mockResolvedValue(mockOCRResults.success)
    ;(AIAnalysisService.analyzeIngredients as jest.Mock).mockResolvedValue(mockAIResults.failure)

    // 创建任务
    await TaskProcessor.createTask(taskId, {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
    })

    // 处理图片
    await TaskProcessor.processImageAsync(taskId, imageBase64)

    // 获取更新后的任务
    const updatedTask = await TaskProcessor.getTask(taskId)

    expect(updatedTask).toEqual(
      expect.objectContaining({
        id: taskId,
        status: 'failed',
        progress: 0,
        processing_step: '处理失败',
        error_message: 'AI分析失败: AI分析失败：服务不可用',
      })
    )
  })

  it('应该在没有识别到配料时正确处理', async () => {
    // 模拟OCR成功但没有识别到配料
    ;(OCRService.processImage as jest.Mock).mockResolvedValue(mockOCRResults.noIngredients)

    // 创建任务
    await TaskProcessor.createTask(taskId, {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
    })

    // 处理图片
    await TaskProcessor.processImageAsync(taskId, imageBase64)

    // 获取更新后的任务
    const updatedTask = await TaskProcessor.getTask(taskId)

    expect(updatedTask).toEqual(
      expect.objectContaining({
        id: taskId,
        status: 'failed',
        progress: 0,
        processing_step: '处理失败',
        error_message: '未能从图片中识别到配料信息，请确保图片清晰且包含配料表',
      })
    )
  })
})