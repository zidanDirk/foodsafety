const { SimpleAIAnalysisService } = require('../../lib/simple-ai-analysis.js')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing DeepSeek API connection...')
    
    // 测试API连接
    const connectionTest = await SimpleAIAnalysisService.testAPIConnection()
    console.log('Connection test result:', connectionTest)

    if (!connectionTest.success) {
      return res.status(500).json({
        error: 'API connection failed',
        details: connectionTest.error
      })
    }

    // 测试配料分析
    const testIngredients = [
      { name: '小麦粉', position: 1 },
      { name: '白砂糖', position: 2 },
      { name: '植物油', position: 3 }
    ]

    console.log('Testing ingredient analysis...')
    const analysisResult = await SimpleAIAnalysisService.analyzeIngredients(testIngredients)
    console.log('Analysis result:', analysisResult)

    return res.status(200).json({
      message: 'DeepSeek API test completed',
      connectionTest,
      analysisResult
    })

  } catch (error) {
    console.error('DeepSeek API test failed:', error)
    return res.status(500).json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    })
  }
}
