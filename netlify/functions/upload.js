// Netlify函数 - 处理文件上传API（简化版本）

exports.handler = async (event) => {
  console.log('Upload function called:', event.httpMethod, event.path)

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

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
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
    console.log('Processing upload request')

    // 创建任务ID
    const taskId = Date.now().toString() + Math.random().toString(36).substring(2, 9)

    console.log('Generated task ID:', taskId)

    // 返回成功响应，模拟文件上传成功
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
