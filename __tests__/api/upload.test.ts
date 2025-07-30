import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/upload'
import { TaskProcessor } from '../../lib/task-manager'
import { initializeDatabase } from '../../lib/database'
import { validateConfig, logConfigStatus } from '../../lib/config'

// 模拟依赖模块
jest.mock('../../lib/task-manager', () => ({
  TaskProcessor: {
    initializeStorage: jest.fn(),
    createTask: jest.fn(),
    processImageAsync: jest.fn(),
    updateTask: jest.fn(),
  },
}))

jest.mock('../../lib/database', () => ({
  initializeDatabase: jest.fn(),
}))

jest.mock('../../lib/config', () => ({
  validateConfig: jest.fn(),
  logConfigStatus: jest.fn(),
}))

// 模拟文件系统
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  unlinkSync: jest.fn(),
  createReadStream: jest.fn().mockReturnValue({
    on: jest.fn(function on(event, callback) {
      if (event === 'end') {
        // 模拟文件读取完成
        setTimeout(() => callback(), 0)
      }
      return this
    }),
  }),
}))

// 模拟 formidable
jest.mock('formidable', () => {
  return {
    IncomingForm: jest.fn().mockImplementation(() => {
      return {
        parse: jest.fn((req, callback) => {
          // 模拟解析结果
          callback(null, {}, {
            image: {
              originalFilename: 'test.jpg',
              size: 1024,
              mimetype: 'image/jpeg',
              filepath: '/tmp/test.jpg',
            },
          })
        }),
      }
    }),
  }
})

// 模拟 uuid
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-task-id'),
}))

// 模拟 utils
jest.mock('../../lib/utils', () => ({
  generateTaskId: jest.fn().mockReturnValue('test-task-id'),
}))

describe('Upload API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // 默认模拟实现
    ;(TaskProcessor.initializeStorage as jest.Mock).mockResolvedValue(true)
    ;(initializeDatabase as jest.Mock).mockResolvedValue(true)
    ;(validateConfig as jest.Mock).mockReturnValue({ isValid: true })
    ;(TaskProcessor.createTask as jest.Mock).mockResolvedValue({
      id: 'test-task-id',
      status: 'pending',
      progress: 0,
      processing_step: 'created',
    })
  })

  it('应该成功处理有效的图片上传', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      taskId: 'test-task-id',
      message: '文件上传成功，正在处理中...',
      fileInfo: {
        name: 'test.jpg',
        size: 1024,
        type: 'image/jpeg',
      },
    })
  })

  it('应该拒绝非POST请求', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(405)
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Method not allowed',
    })
  })

  it('应该拒绝无效的文件类型', async () => {
    // 重新模拟 formidable 以返回无效的文件类型
    jest.mock('formidable', () => {
      return {
        IncomingForm: jest.fn().mockImplementation(() => {
          return {
            parse: jest.fn((req, callback) => {
              callback(null, {}, {
                image: {
                  originalFilename: 'test.txt',
                  size: 1024,
                  mimetype: 'text/plain',
                  filepath: '/tmp/test.txt',
                },
              })
            }),
          }
        }),
      }
    })

    // 重新导入 handler 以使用新的模拟
    const freshHandler = await import('../../pages/api/upload')

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
      },
    })

    await freshHandler.default(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      error: '只支持 JPEG、PNG、GIF、WebP 格式的图片',
    })
  })

  it('应该拒绝过大的文件', async () => {
    // 重新模拟 formidable 以返回过大的文件
    jest.mock('formidable', () => {
      return {
        IncomingForm: jest.fn().mockImplementation(() => {
          return {
            parse: jest.fn((req, callback) => {
              callback(null, {}, {
                image: {
                  originalFilename: 'test.jpg',
                  size: 6 * 1024 * 1024, // 6MB
                  mimetype: 'image/jpeg',
                  filepath: '/tmp/test.jpg',
                },
              })
            }),
          }
        }),
      }
    })

    // 重新导入 handler 以使用新的模拟
    const freshHandler = await import('../../pages/api/upload')

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
      },
    })

    await freshHandler.default(req, res)

    expect(res._getStatusCode()).toBe(400)
    expect(JSON.parse(res._getData())).toEqual({
      error: '文件大小不能超过 5MB（Netlify 平台限制）',
    })
  })

  it('应该在配置无效时返回错误', async () => {
    // 模拟无效的配置
    ;(validateConfig as jest.Mock).mockReturnValue({
      isValid: false,
      errors: ['缺少必要的环境变量'],
    })

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      error: '服务配置不完整',
      details: ['缺少必要的环境变量'],
    })
  })

  it('应该在创建任务失败时返回错误', async () => {
    // 模拟创建任务失败
    ;(TaskProcessor.createTask as jest.Mock).mockResolvedValue(null)

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
      },
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      error: '创建任务失败，请重试',
    })
  })
})