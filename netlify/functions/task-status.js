// Netlify函数 - 处理任务状态查询（简化版本）
exports.handler = async (event, context) => {
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

    // 返回模拟的完成任务结果
    const taskResult = {
      taskId: taskId,
      status: 'completed',
      progress: 100,
      processingStep: 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      result: {
        ocrData: {
          rawText: '配料：小麦粉、白砂糖、植物油、鸡蛋、食用盐、碳酸氢钠、食用香精',
          extractedIngredients: {
            ingredients: [
              { name: '小麦粉', position: 1 },
              { name: '白砂糖', position: 2 },
              { name: '植物油', position: 3 },
              { name: '鸡蛋', position: 4 },
              { name: '食用盐', position: 5 },
              { name: '碳酸氢钠', position: 6 },
              { name: '食用香精', position: 7 }
            ],
            hasIngredients: true,
            extractionConfidence: 0.85
          },
          confidence: 0.85
        },
        healthAnalysis: {
          overallScore: 6,
          ingredientScores: {
            ingredientScores: [
              {
                ingredient: '小麦粉',
                score: 7,
                reason: '提供碳水化合物和蛋白质，是主要的能量来源',
                category: '主要成分',
                healthImpact: '对健康有益'
              },
              {
                ingredient: '白砂糖',
                score: 3,
                reason: '高糖分，过量摄入可能导致肥胖和糖尿病风险',
                category: '添加糖',
                healthImpact: '需要注意'
              },
              {
                ingredient: '植物油',
                score: 5,
                reason: '提供必需脂肪酸，但需注意摄入量',
                category: '油脂',
                healthImpact: '中性影响'
              },
              {
                ingredient: '鸡蛋',
                score: 8,
                reason: '优质蛋白质来源，营养价值高',
                category: '蛋白质',
                healthImpact: '对健康有益'
              },
              {
                ingredient: '食用盐',
                score: 4,
                reason: '必需的调味料，但过量摄入对心血管不利',
                category: '调味料',
                healthImpact: '需要注意'
              },
              {
                ingredient: '碳酸氢钠',
                score: 6,
                reason: '常用的发酵剂，安全性较好',
                category: '添加剂',
                healthImpact: '中性影响'
              },
              {
                ingredient: '食用香精',
                score: 4,
                reason: '人工添加剂，建议适量摄入',
                category: '香料',
                healthImpact: '需要注意'
              }
            ]
          },
          analysisReport: '本产品包含 7 种配料。总体健康度评分为 6/10 分，属于中等健康水平。\\n\\n主要优点：含有小麦粉和鸡蛋等营养成分，能提供基本的营养需求。\\n\\n需要注意：含有白砂糖和人工香精，建议适量食用。\\n\\n建议：作为偶尔的零食可以接受，但不建议大量或频繁食用。',
          recommendations: '1. 适量食用，避免过量摄入糖分\\n2. 搭配水果或牛奶食用，增加营养价值\\n3. 选择运动后食用，有助于能量补充\\n4. 注意查看营养标签，了解具体含量'
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(taskResult)
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
