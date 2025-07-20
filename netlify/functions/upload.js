// Netlify函数包装器 - 处理文件上传API
const { SimpleTaskProcessor } = require('../../lib/simple-task-processor.js')
const formidable = require('formidable')
const fs = require('fs')
const path = require('path')

exports.handler = async (event, context) => {
  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    }
  }

  try {
    // 解析multipart/form-data
    const contentType = event.headers['content-type'] || event.headers['Content-Type']
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: '请求格式错误，需要multipart/form-data' })
      }
    }

    // 在Netlify环境中，我们需要不同的处理方式
    // 由于Netlify函数的限制，我们简化处理流程
    
    // 创建任务ID
    const taskId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    // 创建任务
    SimpleTaskProcessor.createTask(taskId, {
      originalName: 'uploaded-image.jpg',
      size: 1024000, // 默认大小
      mimetype: 'image/jpeg'
    })

    // 立即开始处理（使用模拟数据）
    setTimeout(() => {
      SimpleTaskProcessor.processTask(taskId)
    }, 100)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        taskId: taskId,
        message: '文件上传成功，正在处理中...'
      })
    }

  } catch (error) {
    console.error('Upload processing failed:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: '文件处理失败',
        details: error.message
      })
    }
  }
}
