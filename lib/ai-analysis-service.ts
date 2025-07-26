// DeepSeek AI健康度分析服务
export interface IngredientScore {
  ingredient: string
  score: number
  reason: string
  category: string
  healthImpact: string
}

export interface HealthAnalysis {
  overallScore: number
  ingredientScores: IngredientScore[]
  analysisReport: string
  recommendations: string
}

export interface AIAnalysisResult {
  success: boolean
  data?: HealthAnalysis
  error?: string
}

export class AIAnalysisService {
  private static readonly DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'
  private static readonly MODEL_NAME = 'deepseek-chat'

  // 分析配料健康度
  static async analyzeIngredients(ingredients: Array<{ name: string; position: number }>): Promise<AIAnalysisResult> {
    try {
      // 如果没有配置API密钥，使用模拟数据
      if (!process.env.DEEPSEEK_API_KEY) {
        console.log('DeepSeek API未配置，使用模拟数据')
        return {
          success: true,
          data: this.generateMockAnalysis(ingredients)
        }
      }

      const prompt = this.buildAnalysisPrompt(ingredients)
      const response = await this.callDeepSeekAPI(prompt)
      
      if (!response.success) {
        throw new Error(response.error || 'AI分析失败')
      }

      const analysisData = this.parseAIResponse(response.data, ingredients)
      
      return {
        success: true,
        data: analysisData
      }

    } catch (error) {
      console.error('AI健康度分析失败:', error)
      console.log('使用模拟数据作为降级方案')
      
      return {
        success: true,
        data: this.generateMockAnalysis(ingredients)
      }
    }
  }

  // 构建分析提示词
  private static buildAnalysisPrompt(ingredients: Array<{ name: string; position: number }>): string {
    const ingredientList = ingredients.map(item => item.name).join('、')
    
    return `请作为一名专业的营养师，分析以下食品配料的健康度：

配料列表：${ingredientList}

请按照以下JSON格式返回分析结果：

{
  "overallScore": 数字(1-10分，10分最健康),
  "ingredientScores": [
    {
      "ingredient": "配料名称",
      "score": 数字(1-10分),
      "reason": "评分理由，简洁明了",
      "category": "配料分类(如：主要成分、添加糖、防腐剂等)",
      "healthImpact": "健康影响(对健康有益/需要注意/中性影响)"
    }
  ],
  "analysisReport": "整体分析报告，包含优缺点",
  "recommendations": "健康建议，用\\n分隔多条建议"
}

要求：
1. 评分要客观公正，基于营养学原理
2. 理由要简洁明了，易于理解
3. 分类要准确
4. 建议要实用可行
5. 只返回JSON，不要其他文字`
  }

  // 调用DeepSeek API
  private static async callDeepSeekAPI(prompt: string): Promise<{ success: boolean; data?: string; error?: string }> {
    try {
      const response = await fetch(this.DEEPSEEK_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: this.MODEL_NAME,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API请求失败: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.choices || !result.choices[0] || !result.choices[0].message) {
        throw new Error('DeepSeek API响应格式异常')
      }

      return {
        success: true,
        data: result.choices[0].message.content
      }

    } catch (error) {
      console.error('DeepSeek API调用失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'API调用失败'
      }
    }
  }

  // 解析AI响应
  private static parseAIResponse(aiResponse: string, ingredients: Array<{ name: string; position: number }>): HealthAnalysis {
    try {
      // 尝试提取JSON部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('AI响应中未找到JSON格式数据')
      }

      const parsedData = JSON.parse(jsonMatch[0])
      
      // 验证必要字段
      if (!parsedData.overallScore || !parsedData.ingredientScores || !Array.isArray(parsedData.ingredientScores)) {
        throw new Error('AI响应数据格式不完整')
      }

      // 确保所有配料都有评分
      const scoredIngredients = new Set(parsedData.ingredientScores.map((item: any) => item.ingredient))
      const missingIngredients = ingredients.filter(ing => !scoredIngredients.has(ing.name))
      
      // 为缺失的配料添加默认评分
      missingIngredients.forEach(ingredient => {
        parsedData.ingredientScores.push({
          ingredient: ingredient.name,
          score: 5,
          reason: '常见食品配料，营养价值中等',
          category: '其他',
          healthImpact: '中性影响'
        })
      })

      return {
        overallScore: Math.max(1, Math.min(10, Math.round(parsedData.overallScore))),
        ingredientScores: parsedData.ingredientScores.map((item: any) => ({
          ingredient: item.ingredient || '未知配料',
          score: Math.max(1, Math.min(10, Math.round(item.score || 5))),
          reason: item.reason || '暂无详细分析',
          category: item.category || '其他',
          healthImpact: item.healthImpact || '中性影响'
        })),
        analysisReport: parsedData.analysisReport || '分析报告生成中...',
        recommendations: parsedData.recommendations || '建议适量食用'
      }

    } catch (error) {
      console.error('解析AI响应失败:', error)
      console.log('AI原始响应:', aiResponse)
      
      // 返回降级分析
      return this.generateMockAnalysis(ingredients)
    }
  }

  // 生成模拟分析结果
  private static generateMockAnalysis(ingredients: Array<{ name: string; position: number }>): HealthAnalysis {
    const ingredientScores: IngredientScore[] = ingredients.map(ingredient => {
      const name = ingredient.name.toLowerCase()
      
      // 基于配料名称的简单评分逻辑
      let score = 5
      let reason = '一般的食品配料'
      let category = '其他'
      let healthImpact = '中性影响'

      if (name.includes('小麦') || name.includes('面粉') || name.includes('燕麦')) {
        score = 7
        reason = '提供碳水化合物和蛋白质，是主要的能量来源'
        category = '主要成分'
        healthImpact = '对健康有益'
      } else if (name.includes('糖') || name.includes('甜') || name.includes('蜜')) {
        score = 3
        reason = '高糖分，过量摄入可能导致肥胖和糖尿病风险'
        category = '添加糖'
        healthImpact = '需要注意'
      } else if (name.includes('油') || name.includes('脂')) {
        score = 5
        reason = '提供必需脂肪酸，但需注意摄入量'
        category = '油脂'
        healthImpact = '中性影响'
      } else if (name.includes('鸡蛋') || name.includes('牛奶') || name.includes('奶粉')) {
        score = 8
        reason = '优质蛋白质来源，营养价值高'
        category = '蛋白质'
        healthImpact = '对健康有益'
      } else if (name.includes('盐') || name.includes('钠')) {
        score = 4
        reason = '必需的调味料，但过量摄入对心血管不利'
        category = '调味料'
        healthImpact = '需要注意'
      } else if (name.includes('防腐') || name.includes('色素') || name.includes('香精')) {
        score = 3
        reason = '人工添加剂，建议适量摄入'
        category = '添加剂'
        healthImpact = '需要注意'
      } else if (name.includes('维生素') || name.includes('矿物质')) {
        score = 8
        reason = '有益的营养强化成分'
        category = '营养强化剂'
        healthImpact = '对健康有益'
      }

      return {
        ingredient: ingredient.name,
        score,
        reason,
        category,
        healthImpact
      }
    })

    const overallScore = ingredientScores.length > 0 
      ? Math.round(ingredientScores.reduce((sum, item) => sum + item.score, 0) / ingredientScores.length)
      : 5

    const healthLevel = overallScore >= 8 ? '较健康' : overallScore >= 6 ? '中等健康' : '需要注意'
    
    const analysisReport = `本产品包含 ${ingredients.length} 种配料。总体健康度评分为 ${overallScore}/10 分，属于${healthLevel}水平。

主要优点：${ingredientScores.filter(item => item.score >= 7).map(item => item.ingredient).join('、') || '无明显优点'}等成分营养价值较高。

需要注意：${ingredientScores.filter(item => item.score <= 4).map(item => item.ingredient).join('、') || '整体配料较为健康'}等成分建议适量摄入。

建议：作为${overallScore >= 7 ? '健康' : '偶尔'}食用的食品，${overallScore >= 7 ? '可以' : '不建议'}经常食用。`

    const recommendations = [
      '1. 适量食用，避免过量摄入',
      '2. 搭配新鲜蔬果，增加营养价值',
      '3. 注意查看营养标签，了解具体含量',
      overallScore <= 5 ? '4. 建议选择更健康的替代品' : '4. 可作为均衡饮食的一部分'
    ].join('\n')

    return {
      overallScore,
      ingredientScores,
      analysisReport,
      recommendations
    }
  }
}
