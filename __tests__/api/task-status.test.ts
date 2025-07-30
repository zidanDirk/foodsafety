import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/task-status'
import { TaskProcessor } from '../../lib/task-manager'

// 模拟 TaskProcessor
jest.mock('../../lib/task-manager', () => ({
  TaskProcessor: {
    initializeStorage: jest.fn(),
    getTaskResult: jest.fn(),
  },
}))

describe('Task Status API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // 默认模拟实现
    ;(TaskProcessor.initializeStorage as jest.Mock).mockResolvedValue(true)
  })

  it('应该返回任务状态信息', async () => {
    // 模拟任务结果
    const mockTaskResult = {
      taskId: 'test-task-id',
      status: 'completed',
      progress: 100,
      processingStep: '分析完成',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:05:00Z',
      completedAt: '2023-01-01T00:05:00Z',
      result: {
        ocrData: { rawText: '配料表', extractedIngredients: {} },
        healthAnalysis: { score: 80, details: '健康评估' },
      },
    }

    ;(TaskProcessor.getTaskResult as jest.Mock).mockResolvedValue(mockTaskResult)

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        taskId: 'test-task-id',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(mockTaskResult)
  })

  it('应该在缺少taskId参数时返回错误', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: {},
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      error: '缺少taskId参数',
    })
  })

  it('应该在任务不存在时返回404', async () => {
    // 模拟任务不存在
    ;(TaskProcessor.getTaskResult as jest.Mock).mockResolvedValue(null)

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        taskId: 'non-existent-task-id',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(404)
    expect(JSON.parse(res._getData())).toEqual({
      error: '任务不存在',
      taskId: 'non-existent-task-id',
    })
  })

  it('应该拒绝非GET请求', async () => {
    const { req, res } = createMocks({
      method: 'POST',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed',
    })
  })

  it('应该在查询任务状态失败时返回错误', async () => {
    // 模拟查询失败
    ;(TaskProcessor.getTaskResult as jest.Mock).mockRejectedValue(
      new Error('数据库查询失败')
    )

    const { req, res } = createMocks({
      method: 'GET',
      query: {
        taskId: 'test-task-id',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      error: '查询任务状态失败',
      details: '数据库查询失败',
    })
  })
})