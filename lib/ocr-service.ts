// OCR服务配置 - 百度OCR API集成
export class OCRService {
  private static accessToken: string | null = null
  private static tokenExpiry: number = 0

  // 百度OCR API配置
  private static readonly BAIDU_AK = process.env.BAIDU_OCR_API_KEY 
  private static readonly BAIDU_SK = process.env.BAIDU_OCR_SECRET_KEY
  private static readonly OCR_API_URL = 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic'
  private static readonly TOKEN_API_URL = 'https://aip.baidubce.com/oauth/2.0/token'

  /**
   * 获取百度API访问令牌
   * 实现令牌缓存机制，避免频繁请求
   */
  private static async getAccessToken(): Promise<string> {
    // 检查缓存的令牌是否仍然有效
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch(
        `${this.TOKEN_API_URL}?grant_type=client_credentials&client_id=${this.BAIDU_AK}&client_secret=${this.BAIDU_SK}`,
        { method: 'POST' }
      )

      if (!response.ok) {
        throw new Error(`Token request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.access_token) {
        throw new Error('Failed to get access token from Baidu API')
      }

      // 缓存令牌，设置过期时间（提前5分钟过期以确保安全）
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

      return this.accessToken as string
    } catch (error) {
      console.error('Failed to get Baidu OCR access token:', error)
      throw new Error('OCR service authentication failed')
    }
  }

  /**
   * 从图片中提取文本 - 百度OCR API实现
   */
  static async extractText(imageBuffer: Buffer): Promise<{
    text: string
    confidence: number
  }> {
    try {
      // 获取访问令牌
      const accessToken = await this.getAccessToken()

      // 将图片转换为base64
      const imageBase64 = imageBuffer.toString('base64')

      // 构建请求参数
      const requestBody = new URLSearchParams({
        image: imageBase64,
        detect_direction: 'false',
        paragraph: 'false',
        probability: 'true', // 启用置信度返回
        multidirectional_recognize: 'false'
      })

      // 调用百度OCR API
      const response = await fetch(
        `${this.OCR_API_URL}?access_token=${accessToken}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: requestBody
        }
      )

      if (!response.ok) {
        throw new Error(`OCR API request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      // 检查API响应是否包含错误
      if (result.error_code) {
        throw new Error(`Baidu OCR API error: ${result.error_code} - ${result.error_msg}`)
      }

      // 处理OCR结果
      return this.processOCRResult(result)

    } catch (error) {
      console.error('OCR extraction failed:', error)
      throw new Error(`Failed to extract text from image: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * 处理百度OCR API返回的结果
   */
  private static processOCRResult(result: any): { text: string; confidence: number } {
    if (!result.words_result || !Array.isArray(result.words_result)) {
      return { text: '', confidence: 0 }
    }

    // 提取所有识别的文字
    const textLines: string[] = []
    const confidenceScores: number[] = []

    result.words_result.forEach((item: any) => {
      if (item.words) {
        textLines.push(item.words)

        // 提取置信度（如果可用）
        if (item.probability && item.probability.average) {
          confidenceScores.push(item.probability.average)
        }
      }
    })

    // 合并所有文本行
    const fullText = textLines.join('\n')

    // 计算平均置信度
    const averageConfidence = confidenceScores.length > 0
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length
      : 0.8 // 默认置信度

    return {
      text: fullText,
      confidence: averageConfidence
    }
  }

  // 从OCR文本中提取配料信息
  static extractIngredients(text: string): {
    ingredients: Array<{ name: string; position: number }>
    hasIngredients: boolean
    extractionConfidence: number
  } {
    // 常见的配料表关键词
    const ingredientKeywords = [
      '配料', '成分', '原料', '配方', '组成',
      '配料表', '成分表', '原料表',
      'ingredients', 'composition'
    ]

    // 检查是否包含配料信息
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

    // 提取配料列表
    const ingredients: Array<{ name: string; position: number }> = []

    // 分割文本，寻找配料列表
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

    let ingredientStartIndex = -1
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.toLowerCase() || ''
      if (ingredientKeywords.some(keyword => line.includes(keyword.toLowerCase()))) {
        ingredientStartIndex = i
        break
      }
    }

    if (ingredientStartIndex >= 0) {
      // 从配料关键词后开始提取
      const ingredientText = lines.slice(ingredientStartIndex).join(' ')

      // 移除配料关键词
      let cleanText = ingredientText
      ingredientKeywords.forEach(keyword => {
        cleanText = cleanText.replace(new RegExp(keyword, 'gi'), '')
      })

      // 分割配料（常见分隔符：逗号、顿号、分号等）
      const rawIngredients = cleanText
        .split(/[,，、；;]/)
        .map(item => item.trim())
        .filter(item => item.length > 0 && item.length < 50) // 过滤过长的项目

      // 清理和标准化配料名称
      rawIngredients.forEach((ingredient, index) => {
        // 移除括号内容和特殊字符
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

    // 计算提取置信度
    const extractionConfidence = ingredients.length > 0 ?
      Math.min(0.9, 0.3 + (ingredients.length * 0.1)) : 0

    return {
      ingredients,
      hasIngredients: ingredients.length > 0,
      extractionConfidence
    }
  }

  // 完整的OCR处理流程
  static async processImage(imageBuffer: Buffer) {
    // 1. 提取文本
    const { text, confidence } = await this.extractText(imageBuffer)

    // 2. 提取配料信息
    const ingredientData = this.extractIngredients(text)

    return {
      rawText: text,
      ocrConfidence: confidence,
      extractedIngredients: ingredientData,
      success: ingredientData.hasIngredients
    }
  }
}