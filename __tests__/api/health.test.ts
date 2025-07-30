import { createMocks } from 'node-mocks-http'
import handler from '../../pages/api/health'

describe('Health API', () => {
  it('应该返回健康状态信息', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(200)
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        status: 'healthy',
        services: expect.objectContaining({
          database: expect.any(Boolean),
          ocr: expect.any(Boolean),
          ai: expect.any(Boolean),
        }),
        environment: expect.any(String),
      })
    )
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

  it('应该在错误情况下返回错误信息', async () => {
    // 模拟一个错误场景
    const originalISOString = Date.prototype.toISOString
    Date.prototype.toISOString = () => {
      throw new Error('模拟错误')
    }

    const { req, res } = createMocks({
      method: 'GET',
    })

    await handler(req, res)

    expect(res._getStatusCode()).toBe(500)
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        status: 'unhealthy',
      })
    )

    // 恢复原始方法
    Date.prototype.toISOString = originalISOString
  })
})