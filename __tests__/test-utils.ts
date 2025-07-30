// 测试工具和共享的模拟数据

// 模拟的任务数据
export const mockTasks = {
  pendingTask: {
    id: 'pending-task-id',
    status: 'pending',
    progress: 0,
    processing_step: 'created',
    file_info: {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
    },
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
  },

  processingTask: {
    id: 'processing-task-id',
    status: 'processing',
    progress: 50,
    processing_step: 'OCR识别中',
    file_info: {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
    },
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:02:00Z',
  },

  completedTask: {
    id: 'completed-task-id',
    status: 'completed',
    progress: 100,
    processing_step: '分析完成',
    file_info: {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
    },
    ocr_result: {
      success: true,
      rawText: '配料表：水、盐、糖',
      extractedIngredients: {
        hasIngredients: true,
        ingredients: ['水', '盐', '糖'],
      },
    },
    ai_result: {
      score: 80,
      details: '该食品配料简单，无明显不健康成分',
    },
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:05:00Z',
    completed_at: '2023-01-01T00:05:00Z',
  },

  failedTask: {
    id: 'failed-task-id',
    status: 'failed',
    progress: 0,
    processing_step: '处理失败',
    file_info: {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg',
    },
    error_message: 'OCR识别失败：图片不清晰',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:01:00Z',
  },
}

// 模拟的OCR结果
export const mockOCRResults = {
  success: {
    success: true,
    rawText: '配料表：水、盐、糖',
    extractedIngredients: {
      hasIngredients: true,
      ingredients: ['水', '盐', '糖'],
    },
  },

  noIngredients: {
    success: true,
    rawText: '产品名称：测试产品',
    extractedIngredients: {
      hasIngredients: false,
      ingredients: [],
    },
  },

  failure: {
    success: false,
    error: 'OCR识别失败：图片不清晰',
  },
}

// 模拟的AI分析结果
export const mockAIResults = {
  success: {
    success: true,
    data: {
      score: 80,
      details: '该食品配料简单，无明显不健康成分',
    },
  },

  failure: {
    success: false,
    error: 'AI分析失败：服务不可用',
  },
}

// 创建模拟的HTTP请求和响应
export function createMockRequest(method: string, url: string, options: any = {}) {
  return {
    method,
    url,
    headers: options.headers || {},
    query: options.query || {},
    body: options.body || {},
    ...options,
  }
}

// 创建模拟的HTTP响应
export function createMockResponse() {
  const res: any = {
    statusCode: 200,
    data: '',
    headers: {},
    
    status: function(code: number) {
      this.statusCode = code
      return this
    },
    
    json: function(data: any) {
      this.data = JSON.stringify(data)
      return this
    },
    
    send: function(data: any) {
      this.data = typeof data === 'string' ? data : JSON.stringify(data)
      return this
    },
    
    setHeader: function(name: string, value: string) {
      this.headers[name] = value
      return this
    },
  }
  
  return res
}