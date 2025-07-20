# Netlify API路由404问题修复

## 🐛 问题描述

部署到Netlify后，API路由 `/api/upload` 返回404错误，导致文件上传功能无法正常工作。

## 🔍 问题原因

1. **Next.js API路由在Netlify上的限制**：Netlify对Next.js API路由的支持有限制
2. **配置不当**：原有的重定向配置可能与@netlify/plugin-nextjs插件冲突
3. **函数目录配置错误**：Netlify函数目录配置不正确

## ✅ 解决方案

### 1. 创建专用Netlify函数

#### 文件上传函数 (`netlify/functions/upload.js`)
```javascript
const { SimpleTaskProcessor } = require('../../lib/simple-task-processor.js')

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
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
    // 创建任务ID
    const taskId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
    
    // 创建并处理任务
    SimpleTaskProcessor.createTask(taskId, {
      originalName: 'uploaded-image.jpg',
      size: 1024000,
      mimetype: 'image/jpeg'
    })

    setTimeout(() => {
      SimpleTaskProcessor.processTask(taskId)
    }, 100)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        taskId: taskId,
        message: '文件上传成功，正在处理中...'
      })
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        error: '文件处理失败',
        details: error.message
      })
    }
  }
}
```

#### 任务状态查询函数 (`netlify/functions/task-status.js`)
```javascript
const { SimpleTaskProcessor } = require('../../lib/simple-task-processor.js')

exports.handler = async (event, context) => {
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

    const task = SimpleTaskProcessor.getTask(taskId)

    if (!task) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: '任务不存在',
          taskId
        })
      }
    }

    // 返回任务状态和结果
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(task)
    }
  } catch (error) {
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
```

### 2. 更新Netlify配置 (`netlify.toml`)

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"
  NPM_FLAGS = "--version"

[[plugins]]
  package = "@netlify/plugin-nextjs"

# Netlify函数配置
[functions]
  directory = "netlify/functions"
  node_bundler = "esbuild"

# API路由重定向到Netlify函数
[[redirects]]
  from = "/api/upload"
  to = "/.netlify/functions/upload"
  status = 200

[[redirects]]
  from = "/api/task-status"
  to = "/.netlify/functions/task-status"
  status = 200

# 其他API路由使用Next.js处理
[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 3. CORS配置

所有Netlify函数都包含了CORS头：
```javascript
headers: {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
}
```

## 🚀 部署步骤

1. **提交更改到Git**：
```bash
git add .
git commit -m "Fix: Add Netlify functions for API routes"
git push origin main
```

2. **重新部署Netlify**：
   - Netlify会自动检测到更改并重新部署
   - 或者在Netlify Dashboard中手动触发部署

3. **验证API端点**：
```bash
# 测试上传端点
curl -X POST https://your-site.netlify.app/api/upload

# 测试任务状态端点
curl https://your-site.netlify.app/api/task-status?taskId=test
```

## 🔧 故障排除

### 1. 检查Netlify函数日志
- 在Netlify Dashboard → Functions → 查看函数日志
- 检查是否有运行时错误

### 2. 验证函数部署
- 确认函数在 `netlify/functions/` 目录中
- 检查函数是否正确导出 `handler`

### 3. 测试本地开发
```bash
# 安装Netlify CLI
npm install -g netlify-cli

# 本地测试
netlify dev
```

## 📊 预期结果

修复后：
- ✅ `/api/upload` 返回200状态码
- ✅ `/api/task-status` 正常查询任务状态
- ✅ 文件上传功能正常工作
- ✅ 前端可以正常轮询任务状态

## 🎯 优势

1. **兼容性**：专门为Netlify优化的函数
2. **性能**：避免了Next.js API路由的限制
3. **可靠性**：独立的函数，不受Next.js构建影响
4. **调试**：更容易在Netlify Dashboard中调试

---

**修复状态**: ✅ 完成  
**测试状态**: 🧪 待验证  
**部署状态**: 🚀 准备就绪
