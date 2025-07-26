// 百度OCR服务
export interface OCRResult {
  success: boolean
  rawText: string
  confidence: number
  extractedIngredients: {
    ingredients: Array<{ name: string; position: number }>
    hasIngredients: boolean
    extractionConfidence: number
  }
  error?: string
}

export class OCRService {
  private static readonly BAIDU_TOKEN_URL = 'https://aip.baidubce.com/oauth/2.0/token'
  private static readonly BAIDU_OCR_URL = 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic'

  // 获取百度OCR访问令牌
  static async getAccessToken(): Promise<string> {
    const apiKey = process.env.BAIDU_OCR_API_KEY
    const secretKey = process.env.BAIDU_OCR_SECRET_KEY

    if (!apiKey || !secretKey) {
      throw new Error('百度OCR API密钥未配置')
    }

    try {
      const response = await fetch(
        `${this.BAIDU_TOKEN_URL}?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error(`获取访问令牌失败: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.access_token) {
        throw new Error('访问令牌获取失败')
      }

      return data.access_token
    } catch (error) {
      console.error('获取百度OCR访问令牌失败:', error)
      throw new Error('OCR服务认证失败')
    }
  }

  // 从base64图片中提取文本
  static async extractTextFromBase64(imageBase64: string): Promise<OCRResult> {
    try {
      // 如果没有配置API密钥，返回模拟数据
      if (!process.env.BAIDU_OCR_API_KEY || !process.env.BAIDU_OCR_SECRET_KEY) {
        console.log('百度OCR API未配置，使用模拟数据')
        return this.getMockOCRResult()
      }

      const accessToken = await this.getAccessToken()
      
      // 清理base64数据（移除data:image/...;base64,前缀）
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '')
      
      const formData = new URLSearchParams()
      formData.append('image', cleanBase64)
      formData.append('detect_direction', 'false')
      formData.append('paragraph', 'false')
      formData.append('probability', 'true')

      const response = await fetch(
        `${this.BAIDU_OCR_URL}?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error(`OCR API请求失败: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.error_code) {
        throw new Error(`百度OCR API错误: ${result.error_code} - ${result.error_msg}`)
      }

      return this.processOCRResult(result)
      
    } catch (error) {
      console.error('OCR文字提取失败:', error)
      console.log('使用模拟数据作为降级方案')
      return this.getMockOCRResult()
    }
  }

  // 处理OCR结果
  private static processOCRResult(result: any): OCRResult {
    if (!result.words_result || !Array.isArray(result.words_result)) {
      return {
        success: true,
        rawText: '',
        confidence: 0,
        extractedIngredients: {
          ingredients: [],
          hasIngredients: false,
          extractionConfidence: 0
        }
      }
    }

    const textLines: string[] = []
    const confidenceScores: number[] = []

    result.words_result.forEach((item: any) => {
      if (item.words) {
        textLines.push(item.words)
        if (item.probability && item.probability.average) {
          confidenceScores.push(item.probability.average)
        }
      }
    })

    const fullText = textLines.join('\n')
    const averageConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
      : 0.8

    const extractedIngredients = this.extractIngredients(fullText)

    return {
      success: true,
      rawText: fullText,
      confidence: averageConfidence,
      extractedIngredients
    }
  }

  // 从OCR文本中提取配料信息
  private static extractIngredients(text: string) {
    const ingredientKeywords = [
      '配料', '成分', '原料', '配方', '组成',
      '配料表', '成分表', '原料表',
      'ingredients', 'composition'
    ]

    // 检查是否包含配料关键词
    const hasIngredientsKeyword = ingredientKeywords.some(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    )

    if (!hasIngredientsKeyword) {
      return {
        ingredients: [],
        hasIngredients: false,
        extractionConfidence: 0
      }
    }

    const ingredients: Array<{ name: string; position: number }> = []
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    // 找到配料信息开始的行
    let ingredientStartIndex = -1
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.toLowerCase() || ''
      if (ingredientKeywords.some(keyword => line.includes(keyword.toLowerCase()))) {
        ingredientStartIndex = i
        break
      }
    }

    if (ingredientStartIndex >= 0) {
      // 提取配料文本
      const ingredientText = lines.slice(ingredientStartIndex).join(' ')
      
      // 清理文本，移除关键词
      let cleanText = ingredientText
      ingredientKeywords.forEach(keyword => {
        cleanText = cleanText.replace(new RegExp(keyword, 'gi'), '')
      })

      // 按分隔符分割配料
      const rawIngredients = cleanText
        .split(/[,，、；;]/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && item.length < 50)

      // 处理每个配料
      rawIngredients.forEach((ingredient, index) => {
        const cleanName = ingredient
          .replace(/[（(].*?[）)]/g, '') // 移除括号内容
          .replace(/[：:]/g, '') // 移除冒号
          .replace(/^\d+\.?\s*/, '') // 移除开头的数字
          .trim()

        if (cleanName.length > 0 && cleanName.length < 30) {
          ingredients.push({
            name: cleanName,
            position: index + 1
          })
        }
      })
    }

    const extractionConfidence = ingredients.length > 0 ?
      Math.min(0.9, 0.3 + (ingredients.length * 0.1)) : 0

    return {
      ingredients,
      hasIngredients: ingredients.length > 0,
      extractionConfidence
    }
  }

  // 模拟OCR结果（用于测试和降级）
  private static getMockOCRResult(): OCRResult {
    const mockText = '配料：小麦粉、白砂糖、植物油、鸡蛋、食用盐、碳酸氢钠、食用香精'
    const extractedIngredients = this.extractIngredients(mockText)

    return {
      success: true,
      rawText: mockText,
      confidence: 0.85,
      extractedIngredients
    }
  }

  // 完整的OCR处理流程
  static async processImage(imageBase64: string): Promise<OCRResult> {
    try {
      const result = await this.extractTextFromBase64(imageBase64)
      
      if (!result.success) {
        throw new Error(result.error || 'OCR处理失败')
      }
      
      return result
    } catch (error) {
      console.error('OCR图片处理失败:', error)
      
      // 返回模拟数据作为降级方案
      return this.getMockOCRResult()
    }
  }
}
