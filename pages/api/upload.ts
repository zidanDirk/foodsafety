import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import { TaskProcessor } from '@/lib/task-manager'
import { generateTaskId } from '@/lib/utils'
import { initializeDatabase } from '@/lib/database'
import { validateConfig, logConfigStatus } from '@/lib/config'

// 禁用默认的 body parser，因为我们需要处理文件上传
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 记录配置状态
    logConfigStatus()

    // 验证配置
    const validation = validateConfig()
    if (!validation.isValid) {
      console.error('配置验证失败:', validation.errors)
      return res.status(500).json({
        error: '服务配置不完整',
        details: validation.errors
      })
    }

    // 初始化存储（数据库或内存）
    await TaskProcessor.initializeStorage()

    // 尝试初始化数据库表（如果使用数据库）
    try {
      await initializeDatabase()
    } catch (dbError) {
      console.warn('数据库初始化失败，使用内存存储:', dbError)
    }

    // 解析上传的文件
    const form = new IncomingForm({
      maxFileSize: 8 * 1024 * 1024, // 8MB
      keepExtensions: true,
    })

    const [, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const file = Array.isArray(files.image) ? files.image[0] : files.image

    if (!file) {
      return res.status(400).json({ error: '未找到上传的文件' })
    }

    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.mimetype || '')) {
      return res.status(400).json({
        error: '只支持 JPEG、PNG、GIF、WebP 格式的图片'
      })
    }

    // 验证文件大小
    if (file.size > 8 * 1024 * 1024) {
      return res.status(400).json({
        error: '文件大小不能超过 8MB'
      })
    }

    // 生成任务ID
    const taskId = generateTaskId()

    // 读取文件并转换为 base64
    const fileBuffer = fs.readFileSync(file.filepath)
    const base64 = fileBuffer.toString('base64')
    const imageBase64 = `data:${file.mimetype};base64,${base64}`

    // 创建任务记录
    const fileInfo = {
      name: file.originalFilename || 'unknown',
      size: file.size,
      type: file.mimetype || 'unknown'
    }

    const task = await TaskProcessor.createTask(taskId, fileInfo)

    if (!task) {
      return res.status(500).json({
        error: '创建任务失败，请重试'
      })
    }

    // 清理临时文件
    fs.unlinkSync(file.filepath)

    // 异步处理图片（不等待完成）
    TaskProcessor.processImageAsync(taskId, imageBase64).catch(error => {
      console.error(`异步处理失败: ${taskId}`, error)
    })

    res.status(200).json({
      success: true,
      taskId,
      message: '文件上传成功，正在处理中...',
      fileInfo
    })

  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      error: '文件上传失败，请重试',
      details: error instanceof Error ? error.message : '未知错误'
    })
  }
}
