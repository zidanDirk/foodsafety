// 环境配置和验证
export interface AppConfig {
  database: {
    url: string | null
    isConfigured: boolean
  }
  ocr: {
    baiduApiKey: string | null
    baiduSecretKey: string | null
    isConfigured: boolean
  }
  ai: {
    deepseekApiKey: string | null
    isConfigured: boolean
  }
  app: {
    environment: 'development' | 'production'
    maxFileSize: number
  }
}

export function getAppConfig(): AppConfig {
  // 支持 POSTGRES_URL 和 DATABASE_URL
  const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL

  const config: AppConfig = {
    database: {
      url: databaseUrl || null,
      isConfigured: !!databaseUrl
    },
    ocr: {
      baiduApiKey: process.env.BAIDU_OCR_API_KEY || null,
      baiduSecretKey: process.env.BAIDU_OCR_SECRET_KEY || null,
      isConfigured: !!(process.env.BAIDU_OCR_API_KEY && process.env.BAIDU_OCR_SECRET_KEY)
    },
    ai: {
      deepseekApiKey: process.env.DEEPSEEK_API_KEY || null,
      isConfigured: !!process.env.DEEPSEEK_API_KEY
    },
    app: {
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      maxFileSize: 8 * 1024 * 1024 // 8MB
    }
  }

  return config
}

export function validateConfig(): { isValid: boolean; errors: string[] } {
  const config = getAppConfig()
  const errors: string[] = []

  // 检查数据库配置
  if (!config.database.isConfigured) {
    errors.push('数据库连接字符串未配置 (需要 POSTGRES_URL 或 DATABASE_URL)')
  }

  // 检查 OCR 配置
  if (!config.ocr.isConfigured) {
    errors.push('百度 OCR API 配置不完整 (BAIDU_OCR_API_KEY, BAIDU_OCR_SECRET_KEY)')
  }

  // AI 配置是可选的，有降级方案
  if (!config.ai.isConfigured) {
    console.warn('DeepSeek AI API 未配置，将使用模拟分析')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function logConfigStatus(): void {
  const config = getAppConfig()
  const validation = validateConfig()

  console.log('=== 应用配置状态 ===')
  console.log(`环境: ${config.app.environment}`)
  console.log(`数据库: ${config.database.isConfigured ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`百度OCR: ${config.ocr.isConfigured ? '✅ 已配置' : '❌ 未配置'}`)
  console.log(`DeepSeek AI: ${config.ai.isConfigured ? '✅ 已配置' : '⚠️ 未配置 (将使用模拟数据)'}`)
  
  if (!validation.isValid) {
    console.log('❌ 配置错误:')
    validation.errors.forEach(error => console.log(`  - ${error}`))
  } else {
    console.log('✅ 配置验证通过')
  }
  console.log('==================')
}
