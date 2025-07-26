import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: !!process.env.DATABASE_URL,
        ocr: !!(process.env.BAIDU_OCR_API_KEY && process.env.BAIDU_OCR_SECRET_KEY),
        ai: !!process.env.DEEPSEEK_API_KEY
      },
      environment: process.env.NODE_ENV || 'development'
    }

    res.status(200).json(health)
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : '未知错误'
    })
  }
}
