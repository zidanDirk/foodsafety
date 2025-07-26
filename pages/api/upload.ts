import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    res.status(200).json({
      success: true,
      taskId,
      message: '文件上传成功，正在处理中...'
    })
  } catch (error) {
    res.status(500).json({ error: '文件上传失败，请重试' })
  }
}
