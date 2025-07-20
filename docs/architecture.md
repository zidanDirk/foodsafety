# 食品安全检测系统架构设计

## 系统概述

本系统是一个基于Next.js的食品安全检测Web应用，部署在Netlify平台，使用Neon Postgres数据库。系统通过OCR识别食品配料信息，并使用大语言模型分析配料健康度。

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Netlify Functions
- **数据库**: Neon Postgres
- **部署**: Netlify
- **OCR服务**: Google Vision API / Tesseract.js
- **大语言模型**: OpenAI GPT-4 / Claude API
- **文件存储**: Netlify Blob Storage / Cloudinary

## 系统架构

### 1. 异步任务处理流程

```
用户上传图片 → 创建任务记录 → 返回任务ID → 前端轮询状态
                    ↓
              后台异步处理:
              1. OCR识别配料
              2. 大模型分析健康度
              3. 更新任务状态
                    ↓
              前端获取结果 → 展示分析报告
```

### 2. API设计

#### 2.1 文件上传API
- **路径**: `/api/upload`
- **方法**: POST
- **功能**: 接收图片文件，创建检测任务
- **响应**: `{ taskId: string, status: 'pending' }`

#### 2.2 任务状态查询API
- **路径**: `/api/task-status`
- **方法**: GET
- **参数**: `taskId`
- **功能**: 查询任务进度和结果
- **响应**:
```json
{
  "taskId": "uuid",
  "status": "pending|processing|completed|failed",
  "progress": 0-100,
  "result": {
    "overallScore": 1-10,
    "ingredients": [...],
    "analysis": "...",
    "recommendations": "..."
  }
}
```

### 3. 数据库设计

#### 3.1 核心表结构
- `detection_tasks`: 任务主表
- `ocr_results`: OCR识别结果
- `health_analysis`: 健康分析结果

#### 3.2 任务状态管理
- `pending`: 任务已创建，等待处理
- `processing`: 正在处理中
- `completed`: 处理完成
- `failed`: 处理失败

### 4. 性能优化策略

#### 4.1 20秒超时限制应对
- 使用异步任务处理，避免长时间API调用
- 前端轮询机制，每2秒查询一次状态
- 任务分步处理，每步更新进度

#### 4.2 文件处理优化
- 图片压缩和格式转换
- 最大文件大小限制（8MB）
- 临时文件清理机制

## 部署配置

### Netlify配置
- 使用`@netlify/plugin-nextjs`插件
- API路由自动转换为Netlify Functions
- 环境变量配置数据库连接和API密钥

### 环境变量
```
DATABASE_URL=postgresql://...
GOOGLE_VISION_API_KEY=...
OPENAI_API_KEY=...
CLOUDINARY_URL=...
```