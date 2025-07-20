// 真实的AI分析服务，集成DeepSeek API - 与ai-analysis.ts保持一致
class SimpleAIAnalysisService {
  static get DEEPSEEK_API_URL() {
    return 'https://api.deepseek.com/v1/chat/completions'
  }

  static get DEEPSEEK_API_KEY() {
    return process.env.DEEPSEEK_API_KEY
  }

  // 测试API连接
  static async testAPIConnection() {
    try {
      if (!this.DEEPSEEK_API_KEY) {
        return { success: false, error: 'API key not configured' }
      }

      const response = await fetch(this.DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: '请回复"连接成功"'
            }
          ],
          max_tokens: 10
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: `API request failed: ${response.status} - ${errorText}`
        }
      }

      const result = await response.json()
      return {
        success: true,
        message: 'API connection successful',
        response: result
      }
    } catch (error) {
      return {
        success: false,
        error: `Connection test failed: ${error.message}`
      }
    }
  }
  
  // 基于规则的配料健康度评分
  static getIngredientScore(ingredientName) {
    const healthyIngredients = {
      '小麦粉': { score: 7, category: '主要成分', reason: '提供碳水化合物和蛋白质，是主要的能量来源' },
      '鸡蛋': { score: 8, category: '蛋白质', reason: '优质蛋白质来源，营养价值高' },
      '牛奶': { score: 8, category: '蛋白质', reason: '富含蛋白质和钙质，营养丰富' },
      '燕麦': { score: 9, category: '主要成分', reason: '富含膳食纤维，有助于消化健康' },
      '坚果': { score: 8, category: '脂肪', reason: '富含健康脂肪和蛋白质' }
    }
    
    const moderateIngredients = {
      '植物油': { score: 5, category: '油脂', reason: '提供必需脂肪酸，但需注意摄入量' },
      '食用盐': { score: 4, category: '调味料', reason: '必需的调味料，但过量摄入对心血管不利' },
      '碳酸氢钠': { score: 6, category: '添加剂', reason: '常用的发酵剂，安全性较好' }
    }
    
    const unhealthyIngredients = {
      '白砂糖': { score: 3, category: '添加糖', reason: '高糖分，过量摄入可能导致肥胖和糖尿病风险' },
      '食用香精': { score: 4, category: '香料', reason: '人工添加剂，建议适量摄入' },
      '防腐剂': { score: 2, category: '添加剂', reason: '化学防腐剂，长期摄入可能有健康风险' },
      '人工色素': { score: 2, category: '添加剂', reason: '人工色素，可能引起过敏反应' }
    }
    
    // 检查具体配料
    if (healthyIngredients[ingredientName]) {
      return { ...healthyIngredients[ingredientName], healthImpact: '对健康有益' }
    }
    
    if (moderateIngredients[ingredientName]) {
      return { ...moderateIngredients[ingredientName], healthImpact: '中性影响' }
    }
    
    if (unhealthyIngredients[ingredientName]) {
      return { ...unhealthyIngredients[ingredientName], healthImpact: '需要注意' }
    }
    
    // 默认评分
    return {
      score: 5,
      category: '未知',
      reason: '暂无该配料的详细健康信息',
      healthImpact: '中性影响'
    }
  }
  
  // 分析配料健康度 - DeepSeek API实现，与ai-analysis.ts保持一致
  static async analyzeIngredients(ingredients) {
    try {
      if (!this.DEEPSEEK_API_KEY) {
        console.warn('DEEPSEEK_API_KEY not configured, using fallback analysis')
        return this.getFallbackAnalysis(ingredients)
      }

      const ingredientList = ingredients.map(ing => ing.name).join('、')
      console.log('Ingredient list:', ingredientList)

      const prompt = this.buildAnalysisPrompt(ingredientList)
      console.log('Analysis prompt length:', prompt.length)

      const requestBody = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一名专业的营养师和食品安全专家，具有丰富的食品成分分析经验。请提供客观、科学的健康度评估，严格按照JSON格式返回结果。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        max_tokens: 2000,
        stream: false
      }

      console.log('DeepSeek API request body:', JSON.stringify(requestBody, null, 2))
      console.log('API Key configured:', !!this.DEEPSEEK_API_KEY)
      console.log('API URL:', this.DEEPSEEK_API_URL)

      // 调用DeepSeek API
      const response = await fetch(this.DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify(requestBody)
      })

      console.log('DeepSeek API response status:', response.status)
      console.log('DeepSeek API response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('DeepSeek API error response:', errorText)
        throw new Error(`DeepSeek API request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log('DeepSeek API response:', JSON.stringify(result, null, 2))

      if (!result.choices || !Array.isArray(result.choices) || result.choices.length === 0) {
        console.error('No choices in DeepSeek API response:', result)
        throw new Error('No choices returned from DeepSeek API')
      }

      if (!result.choices[0].message || !result.choices[0].message.content) {
        console.error('No message content in DeepSeek API response:', result.choices[0])
        throw new Error('No message content in DeepSeek API response')
      }

      const content = result.choices[0].message.content
      console.log('DeepSeek AI content:', content)

      // 解析AI返回的JSON结果
      const analysisResult = this.parseAIResponse(content, ingredients)
      console.log('Parsed analysis result:', analysisResult)

      // 验证和标准化结果
      const finalResult = this.validateAndNormalizeResult(analysisResult, ingredients)
      console.log('Final validated result:', finalResult)

      // 返回标准格式
      return {
        success: true,
        data: finalResult
      }

    } catch (error) {
      console.error('DeepSeek AI analysis failed:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        apiKey: this.DEEPSEEK_API_KEY ? 'configured' : 'missing',
        apiUrl: this.DEEPSEEK_API_URL
      })

      // 如果API调用失败，使用降级分析
      console.warn('Falling back to basic analysis due to API error:', error.message)
      return this.getFallbackAnalysis(ingredients)
    }
  }

  // 构建分析提示词 - 优化版本，确保AI能正确理解和执行
  static buildAnalysisPrompt(ingredientList) {
    console.log('Building prompt for ingredients:', ingredientList)

    return `请作为专业营养师分析以下食品配料的健康度：

配料：${ingredientList}

请返回标准JSON格式的分析结果，包含以下字段：

{
  "overallScore": 6,
  "ingredientScores": [
    {
      "ingredient": "小麦粉",
      "score": 7,
      "reason": "提供碳水化合物和蛋白质",
      "category": "主要成分",
      "healthImpact": "对健康有益"
    }
  ],
  "analysisReport": "本产品包含X种配料，总体健康度为X分...",
  "recommendations": "建议适量食用...",
  "riskFactors": ["高糖分", "添加剂"],
  "benefits": ["提供能量", "含蛋白质"]
}

评分标准（1-10分）：
10分：天然有机营养丰富
8-9分：营养价值高有益健康
6-7分：中性成分适量无害
4-5分：需注意摄入量
2-3分：有潜在健康风险
1分：应避免或严格限制

要求：
1. 只返回JSON格式，不要其他文字
2. 确保所有数字字段为整数
3. 基于科学证据进行评估
4. 分析要客观专业`
  }

  // 解析AI返回的响应 - 与ai-analysis.ts保持一致
  static parseAIResponse(content, ingredients) {
    try {
      // 清理内容，移除可能的markdown标记
      let cleanContent = content.trim()

      // 移除可能的markdown代码块标记
      cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '')

      // 尝试提取JSON部分 - 更严格的匹配
      const jsonMatch = cleanContent.match(/\{[\s\S]*?\}(?=\s*$|$)/)
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response')
      }

      const jsonStr = jsonMatch[0]

      // 验证JSON字符串不为空
      if (!jsonStr || jsonStr.trim().length === 0) {
        throw new Error('Empty JSON string')
      }

      const parsed = JSON.parse(jsonStr)

      // 验证必要字段
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Parsed result is not an object')
      }

      // 确保有基本的结构
      if (!parsed.hasOwnProperty('overallScore') && !parsed.hasOwnProperty('ingredientScores')) {
        throw new Error('Missing required fields in AI response')
      }

      return parsed

    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.log('Raw AI response:', content.substring(0, 500) + (content.length > 500 ? '...' : ''))

      // 如果JSON解析失败，创建基本的响应结构
      return this.createFallbackResponse(ingredients, content, parseError)
    }
  }

  // 降级分析（基于规则）
  static getFallbackAnalysis(ingredients) {
    try {
      const ingredientScores = ingredients.map(ingredient => {
        const analysis = this.getIngredientScore(ingredient.name)
        return {
          ingredient: ingredient.name,
          score: analysis.score,
          reason: analysis.reason,
          category: analysis.category,
          healthImpact: analysis.healthImpact
        }
      })

      // 计算总体评分
      const totalScore = ingredientScores.reduce((sum, item) => sum + item.score, 0)
      const overallScore = Math.round(totalScore / ingredientScores.length)

      // 生成分析报告
      const analysisReport = this.generateAnalysisReport(ingredientScores, overallScore)

      // 生成健康建议
      const recommendations = this.generateRecommendations(ingredientScores, overallScore)

      return {
        success: true,
        data: {
          success: true, // 基于规则的分析成功完成
          overallScore,
          ingredientScores: {
            ingredientScores
          },
          analysisReport,
          recommendations,
          riskFactors: this.extractRiskFactors(ingredientScores),
          benefits: this.extractBenefits(ingredientScores)
        }
      }
    } catch (error) {
      console.error('Fallback analysis failed:', error)
      return {
        success: false,
        error: 'AI分析失败'
      }
    }
  }

  // 验证和标准化结果 - 添加success状态字段
  static validateAndNormalizeResult(result, ingredients) {
    try {
      // 判断分析是否成功
      const isAIAnalysis = result &&
                          result.overallScore &&
                          result.ingredientScores &&
                          Array.isArray(result.ingredientScores) &&
                          result.analysisReport &&
                          result.recommendations

      // 验证总体评分
      const overallScore = this.validateScore(result.overallScore, 5)

      // 验证配料评分
      let ingredientScores = []
      let hasValidIngredientScores = false

      if (result.ingredientScores && Array.isArray(result.ingredientScores)) {
        ingredientScores = result.ingredientScores.map((item, index) => ({
          ingredient: item.ingredient || ingredients[index]?.name || `配料${index + 1}`,
          score: this.validateScore(item.score, 5),
          reason: item.reason || '暂无详细说明',
          category: item.category || '未分类',
          healthImpact: item.healthImpact || '影响待评估'
        }))
        hasValidIngredientScores = result.ingredientScores.length > 0
      } else {
        // 如果没有配料评分，创建默认的
        ingredientScores = ingredients.map((ing) => ({
          ingredient: ing.name,
          score: 5,
          reason: '暂无详细分析',
          category: '未分类',
          healthImpact: '影响待评估'
        }))
      }

      // 确定最终的成功状态
      const analysisSuccess = isAIAnalysis &&
                             hasValidIngredientScores &&
                             result.analysisReport &&
                             result.analysisReport !== '分析报告生成中...' &&
                             result.recommendations &&
                             result.recommendations !== '建议生成中...'

      return {
        success: analysisSuccess,
        overallScore,
        ingredientScores: {
          ingredientScores
        },
        analysisReport: result.analysisReport || '分析报告生成中...',
        recommendations: result.recommendations || '建议生成中...',
        riskFactors: result.riskFactors || [],
        benefits: result.benefits || []
      }
    } catch (error) {
      console.error('Result validation failed:', error)
      return this.createFallbackResponse(ingredients, '', error)
    }
  }

  // 验证评分范围
  static validateScore(score, defaultValue = 5) {
    const numScore = Number(score)
    if (isNaN(numScore) || numScore < 1 || numScore > 10) {
      return defaultValue
    }
    return Math.round(numScore)
  }

  // 创建降级响应
  static createFallbackResponse(ingredients, _originalContent, error) {
    return {
      success: false, // 标记为降级响应，分析未成功
      overallScore: 5,
      ingredientScores: {
        ingredientScores: ingredients.map(ing => ({
          ingredient: ing.name,
          score: 5,
          reason: 'AI分析解析失败，使用默认评分',
          category: '未知',
          healthImpact: '需要进一步分析'
        }))
      },
      analysisReport: `AI分析服务暂时不可用。错误信息：${error?.message || '未知错误'}`,
      recommendations: '建议咨询专业营养师获取准确的健康评估',
      riskFactors: ['分析结果不确定'],
      benefits: []
    }
  }
  
  // 生成分析报告
  static generateAnalysisReport(ingredientScores, overallScore) {
    const totalIngredients = ingredientScores.length
    const healthyCount = ingredientScores.filter(item => item.score >= 7).length
    const unhealthyCount = ingredientScores.filter(item => item.score <= 4).length
    
    let healthLevel = '中等健康'
    if (overallScore >= 8) healthLevel = '健康'
    else if (overallScore <= 4) healthLevel = '不够健康'
    
    return `本产品包含 ${totalIngredients} 种配料。总体健康度评分为 ${overallScore}/10 分，属于${healthLevel}水平。

主要优点：${healthyCount > 0 ? `含有${healthyCount}种有益健康的配料，能提供基本的营养需求。` : '暂无明显健康优势。'}

需要注意：${unhealthyCount > 0 ? `含有${unhealthyCount}种需要注意的配料，建议适量食用。` : '配料相对安全。'}

建议：${overallScore >= 7 ? '可以适量食用，是相对健康的选择。' : overallScore >= 5 ? '作为偶尔的零食可以接受，但不建议大量或频繁食用。' : '建议谨慎食用，寻找更健康的替代品。'}`
  }
  
  // 生成健康建议
  static generateRecommendations(ingredientScores, overallScore) {
    const recommendations = []
    
    if (overallScore <= 6) {
      recommendations.push('适量食用，避免过量摄入')
    }
    
    if (ingredientScores.some(item => item.category === '添加糖')) {
      recommendations.push('注意糖分摄入，搭配运动消耗')
    }
    
    if (ingredientScores.some(item => item.category === '添加剂')) {
      recommendations.push('选择天然成分更多的替代品')
    }
    
    recommendations.push('搭配水果或牛奶食用，增加营养价值')
    recommendations.push('注意查看营养标签，了解具体含量')
    
    return recommendations.join('\n')
  }

  // 提取风险因素
  static extractRiskFactors(ingredientScores) {
    const riskFactors = []

    ingredientScores.forEach(item => {
      if (item.score <= 4) {
        if (item.category === '添加糖') {
          riskFactors.push('高糖分摄入风险')
        } else if (item.category === '添加剂') {
          riskFactors.push('化学添加剂风险')
        } else if (item.category === '香料') {
          riskFactors.push('人工香精风险')
        } else if (item.ingredient.includes('防腐剂')) {
          riskFactors.push('防腐剂健康风险')
        }
      }
    })

    // 去重
    return [...new Set(riskFactors)]
  }

  // 提取健康益处
  static extractBenefits(ingredientScores) {
    const benefits = []

    ingredientScores.forEach(item => {
      if (item.score >= 7) {
        if (item.category === '蛋白质') {
          benefits.push('提供优质蛋白质')
        } else if (item.category === '主要成分') {
          benefits.push('提供基础营养')
        } else if (item.ingredient.includes('维生素')) {
          benefits.push('补充维生素')
        } else if (item.ingredient.includes('矿物质')) {
          benefits.push('补充矿物质')
        }
      }
    })

    // 如果没有明显益处，添加基础益处
    if (benefits.length === 0) {
      benefits.push('提供基础能量')
    }

    // 去重
    return [...new Set(benefits)]
  }
}

module.exports = { SimpleAIAnalysisService }
