import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/init-db'
import * as databaseModule from '../../lib/database'

// 模拟数据库管理器
jest.mock('../../lib/database', () => ({
  DatabaseManager: {
    initializeTables: jest.fn(),
  },
  initializeDatabase: jest.fn(),
}))

describe('Init DB API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('应该初始化数据库并返回成功消息', async () => {
    // 模拟成功的数据库初始化
    ;(databaseModule.initializeDatabase as jest.Mock).mockResolvedValue(true)

    const { req, res } = createMocks({
      method: 'POST',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual({
      success: true,
      message: '数据库初始化成功',
    })
  })

  it('应该在数据库初始化失败时返回错误', async () => {
    // 模拟失败的数据库初始化
    ;(databaseModule.initializeDatabase as jest.Mock).mockResolvedValue(false)

    const { req, res } = createMocks({
      method: 'POST',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: '数据库初始化失败',
    })
  })

  it('应该在数据库初始化抛出异常时返回错误', async () => {
    // 模拟数据库初始化抛出异常
    ;(databaseModule.initializeDatabase as jest.Mock).mockRejectedValue(
      new Error('数据库连接失败')
    )

    const { req, res } = createMocks({
      method: 'POST',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual({
      success: false,
      error: '数据库初始化失败',
      details: '数据库连接失败',
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
})