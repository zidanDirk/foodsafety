import type { NextApiRequest, NextApiResponse } from 'next'
import { initializeDatabase } from '@/lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('开始初始化数据库...')
    
    const success = await initializeDatabase()
    
    if (success) {
      res.status(200).json({
        success: true,
        message: '数据库初始化成功'
      })
    } else {
      res.status(500).json({
        success: false,
        error: '数据库初始化失败'
      })
    }
    
  } catch (error) {
    console.error('数据库初始化错误:', error)
    res.status(500).json({
      success: false,
      error: '数据库初始化失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
}
