// DeepSeek AI分析服务
export class AIAnalysisService {
  private static readonly DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
  private static readonly DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

  /**
   * 分析配料健康度 - DeepSeek API实现
   */
  static async analyzeIngredients(ingredients: Array<{ name: string; position: number }>) {
    try {
      if (!this.DEEPSEEK_API_KEY) {
        console.warn('DEEPSEEK_API_KEY not configured, using fallback analysis')
        return this.getFallbackAnalysis(ingredients)
      }

      const ingredientList = ingredients.map(ing => ing.name).join('、')

      const prompt = this.buildAnalysisPrompt(ingredientList)

      // 调用DeepSeek API
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
        })
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error('Invalid response from DeepSeek API')
      }

      const content = result.choices[0].message.content

      // 解析AI返回的JSON结果
      const analysisResult = this.parseAIResponse(content, ingredients)

      // 验证和标准化结果
      return this.validateAndNormalizeResult(analysisResult, ingredients)

    } catch (error) {
      console.error('DeepSeek AI analysis failed:', error)

      // 如果API调用失败，使用降级分析
      console.warn('Falling back to basic analysis due to API error')
      return this.getFallbackAnalysis(ingredients)
    }
  }

  /**
   * 构建分析提示词
   */
  private static buildAnalysisPrompt(ingredientList: string): string {
    console.log(`ingredientList`, ingredientList)
    return `
作为专业营养师，请分析以下食品配料的健康度：

配料列表：${ingredientList}

请严格按照以下JSON格式返回分析结果：

{
  "overallScore": 数字(1-10),
  "ingredientScores": [
    {
      "ingredient": "配料名称",
      "score": 数字(1-10),
      "reason": "评分原因",
      "category": "配料类别",
      "healthImpact": "健康影响说明"
    }
  ],
  "analysisReport": "详细分析报告",
  "recommendations": "健康建议",
  "riskFactors": ["风险因素1", "风险因素2"],
  "benefits": ["健康益处1", "健康益处2"]
}

评分标准：
- 10分：天然、有机、营养丰富的成分
- 8-9分：营养价值高，对健康有益的成分
- 6-7分：中性成分，适量摄入无害
- 4-5分：需要注意摄入量的成分
- 2-3分：对健康有潜在风险的成分
- 1分：应避免或严格限制的成分

请确保分析客观、专业，基于科学证据。只返回JSON格式的结果，不要包含其他文字。
`
  }

  /**
   * 解析AI返回的响应
   */
  private static parseAIResponse(content: string, ingredients: Array<{ name: string; position: number }>): any {
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

  /**
   * 创建降级响应
   */
  private static createFallbackResponse(ingredients: Array<{ name: string; position: number }>, _originalContent: string, error: any) {
    return {
      overallScore: 5,
      ingredientScores: ingredients.map(ing => ({
        ingredient: ing.name,
        score: 5,
        reason: 'AI分析解析失败，使用默认评分',
        category: '未知',
        healthImpact: '需要进一步分析'
      })),
      analysisReport: `AI分析服务暂时不可用。错误信息：${error.message}`,
      recommendations: '建议咨询专业营养师获取准确的健康评估',
      riskFactors: ['分析结果不确定'],
      benefits: []
    }
  }

  /**
   * 降级分析 - 当API不可用时使用
   */
  private static getFallbackAnalysis(ingredients: Array<{ name: string; position: number }>) {
    const ingredientScores = ingredients.map(ing => {
      // 基于配料名称的简单规则评分
      let score = 5
      let reason = '中性配料，适量摄入'
      let category = '基础配料'

      const name = ing.name.toLowerCase()

      if (name.includes('小麦粉') || name.includes('面粉')) {
        score = 7
        reason = '提供碳水化合物和蛋白质，是主要的能量来源'
        category = '主要成分'
      } else if (name.includes('糖') || name.includes('蔗糖') || name.includes('果糖')) {
        score = 3
        reason = '高糖分，过量摄入可能导致肥胖和糖尿病风险'
        category = '添加糖'
      } else if (name.includes('油') || name.includes('脂')) {
        score = 5
        reason = '提供必需脂肪酸，但需注意摄入量'
        category = '油脂'
      } else if (name.includes('蛋')) {
        score = 8
        reason = '优质蛋白质来源，营养价值高'
        category = '蛋白质'
      } else if (name.includes('盐') || name.includes('钠')) {
        score = 4
        reason = '必需的调味料，但过量摄入对心血管不利'
        category = '调味料'
      } else if (name.includes('香精') || name.includes('香料')) {
        score = 4
        reason = '人工添加剂，建议适量摄入'
        category = '香料'
      } else if (name.includes('防腐剂') || name.includes('保鲜剂')) {
        score = 3
        reason = '化学防腐剂，长期摄入可能有健康风险'
        category = '防腐剂'
      }

      return {
        ingredient: ing.name,
        score,
        reason,
        category,
        healthImpact: score >= 7 ? '对健康有益' : score >= 5 ? '中性影响' : '需要注意'
      }
    })

    const avgScore = Math.round(
      ingredientScores.reduce((sum, item) => sum + item.score, 0) / ingredientScores.length
    )

    return {
      overallScore: avgScore,
      ingredientScores,
      analysisReport: `本产品包含 ${ingredients.length} 种配料。总体健康度评分为 ${avgScore}/10 分。这是基于基础规则的分析结果，建议咨询专业营养师获取更准确的评估。`,
      recommendations: '1. 适量食用，注意营养均衡\n2. 关注配料表中的添加剂含量\n3. 建议搭配新鲜蔬果食用\n4. 如有特殊健康需求，请咨询专业营养师',
      riskFactors: ingredientScores.filter(item => item.score <= 4).map(item => item.ingredient),
      benefits: ingredientScores.filter(item => item.score >= 7).map(item => item.ingredient)
    }
  }

  // 验证和标准化分析结果
  private static validateAndNormalizeResult(result: any, originalIngredients: Array<{ name: string; position: number }>) {
    // 确保必要字段存在
    const normalized: any = {
      overallScore: Math.max(1, Math.min(10, result.overallScore || 5)),
      ingredientScores: [],
      analysisReport: result.analysisReport || '分析报告生成失败',
      recommendations: result.recommendations || '建议咨询专业营养师',
      riskFactors: Array.isArray(result.riskFactors) ? result.riskFactors : [],
      benefits: Array.isArray(result.benefits) ? result.benefits : []
    }

    // 处理配料评分
    if (Array.isArray(result.ingredientScores)) {
      normalized.ingredientScores = result.ingredientScores.map((score: any) => ({
        ingredient: score.ingredient || '未知配料',
        score: Math.max(1, Math.min(10, score.score || 5)),
        reason: score.reason || '无详细说明',
        category: score.category || '未分类',
        healthImpact: score.healthImpact || '影响未知'
      }))
    } else {
      // 如果没有配料评分，为每个配料创建默认评分
      normalized.ingredientScores = originalIngredients.map(ing => ({
        ingredient: ing.name,
        score: 5,
        reason: '无法获取详细分析',
        category: '未知',
        healthImpact: '需要进一步分析'
      }))
    }

    return normalized
  }

  // 生成健康建议摘要
  static generateHealthSummary(analysisResult: any): string {
    const { overallScore, riskFactors, benefits } = analysisResult

    let summary = `总体健康度评分：${overallScore}/10分。`

    if (overallScore >= 8) {
      summary += '这是一个相对健康的食品选择。'
    } else if (overallScore >= 6) {
      summary += '这是一个中等健康度的食品，适量食用。'
    } else if (overallScore >= 4) {
      summary += '这个食品的健康度较低，建议谨慎食用。'
    } else {
      summary += '这个食品存在较多健康风险，建议避免或严格限制摄入。'
    }

    if (riskFactors && riskFactors.length > 0) {
      summary += ` 主要风险因素包括：${riskFactors.slice(0, 3).join('、')}。`
    }

    if (benefits && benefits.length > 0) {
      summary += ` 健康益处包括：${benefits.slice(0, 3).join('、')}。`
    }

    return summary
  }
}