const { SimpleAIAnalysisService } = require('../../lib/simple-ai-analysis.js')

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing AI Analysis Service...')
    
    // 测试配料数据
    const testIngredients = [
      { name: '小麦粉', position: 1 },
      { name: '白砂糖', position: 2 },
      { name: '植物油', position: 3 },
      { name: '鸡蛋', position: 4 },
      { name: '食用盐', position: 5 }
    ]

    console.log('Test ingredients:', testIngredients)

    // 调用AI分析服务
    const analysisResult = await SimpleAIAnalysisService.analyzeIngredients(testIngredients)
    console.log('Analysis result:', JSON.stringify(analysisResult, null, 2))

    // 检查结果结构
    const checks = {
      hasSuccess: analysisResult.hasOwnProperty('success'),
      hasData: analysisResult.hasOwnProperty('data'),
      successValue: analysisResult.success,
      dataStructure: analysisResult.data ? Object.keys(analysisResult.data) : null,
      dataType: typeof analysisResult.data
    }

    console.log('Structure checks:', checks)

    return res.status(200).json({
      message: 'AI Analysis test completed',
      testIngredients,
      analysisResult,
      structureChecks: checks
    })

  } catch (error) {
    console.error('AI Analysis test failed:', error)
    return res.status(500).json({
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    })
  }
}
