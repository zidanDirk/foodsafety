// Netlify函数 - 处理任务状态查询（真实功能）
// 导入真实的任务处理器
const { SimpleTaskProcessor } = require('../../lib/simple-task-processor.js')

exports.handler = async (event) => {
  console.log('Task status function called:', event.httpMethod, event.path)
  console.log('Query parameters:', event.queryStringParameters)

  // 处理CORS预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: ''
    }
  }

  // 只允许GET请求
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    // 从查询参数获取taskId
    const taskId = event.queryStringParameters?.taskId

    if (!taskId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: '缺少taskId参数' })
      }
    }

    console.log('Processing task status request for:', taskId)

    // 使用真实的任务处理器获取任务状态
    const task = SimpleTaskProcessor.getTask(taskId)

    if (!task) {
      console.log('Task not found:', taskId)
      console.log('Available tasks:', Array.from(SimpleTaskProcessor.tasks.keys()))

      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: '任务不存在',
          taskId,
          availableTasks: Array.from(SimpleTaskProcessor.tasks.keys())
        })
      }
    }

    console.log('Found task:', JSON.stringify(task, null, 2))

    // 返回真实的任务状态和结果
    const response = {
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      processingStep: task.processingStep,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      error: task.error
    }

    // 如果任务已完成，包含结果数据
    if (task.status === 'completed' && task.result) {
      response.completedAt = task.completedAt
      response.result = task.result
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    }

  } catch (error) {
    console.error('Task status query failed:', error)
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: '查询任务状态失败',
        details: error.message
      })
    }
  }
}
