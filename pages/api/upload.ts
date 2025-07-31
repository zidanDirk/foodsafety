import type { NextApiRequest, NextApiResponse } from 'next'
import { IncomingForm } from 'formidable'
import fs from 'fs'
import { TaskProcessor } from '@/lib/task-manager'
import { generateTaskId } from '@/lib/utils'
import { initializeDatabase } from '@/lib/database'
import { validateConfig, logConfigStatus } from '@/lib/config'

// Initialize WebSocket server if not already initialized
import '@/pages/api/ws'

// 禁用默认的 body parser，因为我们需要处理文件上传
export const config = {
  api: {
    bodyParser: false,
    // 增加响应时间限制（Netlify Functions 最大 10 秒）
    responseLimit: false,
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

    // 解析上传的文件 - 针对 Netlify 优化
    const form = new IncomingForm({
      maxFileSize: 5 * 1024 * 1024, // 5MB (Netlify 限制)
      keepExtensions: true,
      // 使用内存存储而不是临时文件，减少 I/O 操作
      maxFieldsSize: 5 * 1024 * 1024,
      maxFields: 10,
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

    // 验证文件大小 - Netlify 限制
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        error: '文件大小不能超过 5MB（Netlify 平台限制）'
      })
    }

    // 生成任务ID
    const taskId = generateTaskId()

    // 创建任务记录（先创建任务，再处理文件）
    const fileInfo = {
      name: file.originalFilename || 'unknown',
      size: file.size,
      type: file.mimetype || 'unknown'
    }

    const task = await TaskProcessor.createTask(taskId, fileInfo)

    if (!task) {
      // 清理临时文件
      try {
        fs.unlinkSync(file.filepath)
      } catch (cleanupError) {
        console.warn('清理临时文件失败:', cleanupError)
      }
      return res.status(500).json({
        error: '创建任务失败，请重试'
      })
    }

    // 异步处理文件（避免阻塞响应）
    processFileAsync(taskId, file).catch(error => {
      console.error(`异步文件处理失败: ${taskId}`, error)
      // 更新任务状态为失败
      TaskProcessor.updateTask(taskId, {
        status: 'failed',
        progress: 0,
        processing_step: '文件处理失败',
        error_message: error.message
      }).catch(updateError => {
        console.error('更新任务状态失败:', updateError)
      })
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

// 异步处理文件函数 - 优化内存使用
async function processFileAsync(taskId: string, file: any) {
  try {
    console.log(`开始异步处理文件: ${taskId}, 大小: ${file.size} bytes`)

    // 分块读取文件，避免内存溢出
    const fileBuffer = await readFileInChunks(file.filepath)

    // 转换为 base64
    const base64 = fileBuffer.toString('base64')
    const imageBase64 = `data:${file.mimetype};base64,${base64}`

    // 清理临时文件
    try {
      fs.unlinkSync(file.filepath)
      console.log(`临时文件已清理: ${file.filepath}`)
    } catch (cleanupError) {
      console.warn('清理临时文件失败:', cleanupError)
    }

    // 调用原有的图片处理流程
    await TaskProcessor.processImageAsync(taskId, imageBase64)

  } catch (error) {
    console.error(`文件处理失败: ${taskId}`, error)

    // 清理临时文件
    try {
      fs.unlinkSync(file.filepath)
    } catch (cleanupError) {
      console.warn('清理临时文件失败:', cleanupError)
    }

    throw error
  }
}

// 分块读取文件，减少内存压力
async function readFileInChunks(filePath: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }) // 64KB chunks

    stream.on('data', (chunk: string | Buffer) => {
      const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk
      chunks.push(buffer)
    })

    stream.on('end', () => {
      resolve(Buffer.concat(chunks))
    })

    stream.on('error', (error) => {
      reject(error)
    })
  })
}
