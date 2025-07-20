// 简单的测试函数
exports.handler = async (event) => {
  console.log('Test function called:', event.httpMethod, event.path)

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Netlify function is working!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      path: event.path,
      queryStringParameters: event.queryStringParameters
    })
  }
}
