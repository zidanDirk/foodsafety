import formidable from 'formidable'
const { SimpleTaskProcessor } = require('../../lib/simple-task-processor.js')

// 禁用默认的body parser
export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 确保上传目录存在
    const uploadDir = '/tmp/uploads'
    const fs = require('fs')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // 解析表单数据
    const form = formidable({
      maxFileSize: 8 * 1024 * 1024, // 8MB
      keepExtensions: true,
      uploadDir: uploadDir,
    })

    const [, files] = await form.parse(req)
    const file = files.image?.[0]

    if (!file) {
      return res.status(400).json({ error: '未找到上传的文件' })
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: '只支持 JPEG、PNG、GIF、WebP 格式的图片'
      })
    }

    // 生成任务ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    // 创建任务记录
    const fileInfo = {
      name: file.originalFilename,
      size: file.size,
      type: file.mimetype,
      path: file.filepath
    }

    // 创建任务记录
    const task = SimpleTaskProcessor.createTask(taskId, fileInfo)
    console.log('Task created:', taskId, task)

    // 启动异步处理
    SimpleTaskProcessor.startAsyncProcessing(taskId, file.filepath)

    // 验证任务是否创建成功
    const verifyTask = SimpleTaskProcessor.getTask(taskId)
    console.log('Task verification:', taskId, verifyTask ? 'exists' : 'not found')

    res.status(200).json({
      taskId,
      status: 'pending',
      message: '文件上传成功，正在处理中...',
      fileInfo: {
        name: file.originalFilename,
        size: file.size,
        type: file.mimetype
      }
    })

  } catch (error) {
    console.error('Upload failed:', error)
    res.status(500).json({
      error: '文件上传失败，请重试'
    })
  }
}
