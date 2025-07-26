import type { NextApiRequest, NextApiResponse } from 'next'
import { TaskProcessor } from '@/lib/task-manager'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 初始化存储（数据库或内存）
    await TaskProcessor.initializeStorage()

    const { taskId } = req.query

    if (!taskId || typeof taskId !== 'string') {
      return res.status(400).json({ error: '缺少taskId参数' })
    }

    console.log(`查询任务状态: ${taskId}`)

    // 从数据库获取真实的任务状态
    const taskResult = await TaskProcessor.getTaskResult(taskId)

    if (!taskResult) {
      console.log(`任务不存在: ${taskId}`)

      return res.status(404).json({
        error: '任务不存在',
        taskId
      })
    }

    // 返回真实的任务状态和结果
    res.status(200).json(taskResult)

  } catch (error) {
    console.error('Task status query error:', error)
    res.status(500).json({
      error: '查询任务状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
}
