# 食品安全检测系统

基于Next.js的智能食品安全检测Web应用，通过OCR识别食品配料信息，并使用AI分析配料健康度。

## 功能特性

- 📸 **图片上传**: 支持拍照或从相册选择图片（最大8MB）
- 🔍 **OCR识别**: 自动识别图片中的配料表信息
- 🤖 **AI分析**: 使用大语言模型分析配料健康度（1-10分评分）
- 📊 **详细报告**: 提供每个配料的详细健康分析和建议
- ⚡ **异步处理**: 采用异步任务处理，避免接口超时
- 📱 **响应式设计**: 支持手机、平板、桌面设备

## 技术栈

- **前端**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes, Netlify Functions
- **数据库**: Neon Postgres
- **OCR服务**: 百度OCR API（主要）/ Google Vision API（备用）
- **AI分析**: DeepSeek API（主要）/ OpenAI GPT-4（备用）
- **部署**: Netlify

## 系统架构

### 异步任务处理流程
```
用户上传图片 → 创建任务记录 → 返回任务ID → 前端轮询状态
                    ↓
              后台异步处理:
              1. OCR识别配料
              2. AI分析健康度
              3. 更新任务状态
                    ↓
              前端获取结果 → 展示分析报告
```

### API设计
- `POST /api/upload` - 文件上传和任务创建
- `GET /api/task-status?taskId=xxx` - 任务状态查询

## 快速开始

### 1. 克隆项目
```bash
git clone <repository-url>
cd foodsafety
```

### 2. 安装依赖
```bash
pnpm install
```

### 3. 环境配置
复制环境变量模板：
```bash
cp .env.example .env.local
```

配置必要的环境变量：
```env
# 数据库配置
DATABASE_URL=postgresql://username:password@hostname:port/database

# 百度OCR API配置
BAIDU_OCR_API_KEY=your-baidu-api-key
BAIDU_OCR_SECRET_KEY=your-baidu-secret-key

# DeepSeek API配置
DEEPSEEK_API_KEY=your-deepseek-api-key

# Google Vision API配置（备用，可选）
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_VISION_API_KEY=your-google-vision-api-key

# OpenAI API配置（备用，可选）
OPENAI_API_KEY=your-openai-api-key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE=8388608
```

### 4. 数据库设置
执行数据库初始化脚本：
```sql
-- 参考 docs/database-schema.sql
```

### 5. 启动开发服务器
```bash
pnpm dev
```

访问 http://localhost:3000

## 部署到Netlify

### 1. 准备工作
- 确保代码已推送到Git仓库
- 准备Neon Postgres数据库
- 获取必要的API密钥

### 2. Netlify配置
1. 在Netlify中连接Git仓库
2. 设置构建命令：`pnpm build`
3. 设置发布目录：`.next`
4. 配置环境变量

### 3. 环境变量配置
在Netlify Dashboard中设置以下环境变量：
```
DATABASE_URL=your-neon-postgres-url
GOOGLE_VISION_API_KEY=your-api-key
OPENAI_API_KEY=your-api-key
MAX_FILE_SIZE=8388608
```

### 4. 部署
推送代码到主分支，Netlify将自动构建和部署。

## 开发说明

### 目录结构
```
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   ├── upload/        # 文件上传API
│   │   └── task-status/   # 任务状态查询API
│   ├── detection/         # 检测页面
│   ├── results/           # 结果展示页面
│   └── globals.css        # 全局样式
├── lib/                   # 工具库
│   ├── database.ts        # 数据库操作
│   ├── ocr-service.ts     # OCR服务
│   ├── ai-analysis.ts     # AI分析服务
│   └── task-processor.ts  # 任务处理器
├── docs/                  # 文档
│   ├── database-schema.sql # 数据库结构
│   └── architecture.md    # 架构设计
└── public/                # 静态资源
```

### 核心组件

#### 1. 任务处理器 (TaskProcessor)
负责管理异步任务的完整生命周期：
- OCR文字识别
- 配料信息提取
- AI健康度分析
- 错误处理和恢复

#### 2. 数据库服务 (DatabaseService)
提供数据库操作的统一接口：
- 任务管理
- OCR结果存储
- 健康分析结果存储

#### 3. OCR服务 (OCRService)
处理图片文字识别：
- 支持Google Vision API
- 配料信息智能提取
- 置信度评估

#### 4. AI分析服务 (AIAnalysisService)
进行配料健康度分析：
- 支持OpenAI GPT-4
- 结构化评分输出
- 详细健康建议

## 性能优化

### 1. 异步处理
- 文件上传后立即返回任务ID
- 后台异步处理OCR和AI分析
- 前端轮询获取处理结果

### 2. 错误处理
- 多层错误捕获和处理
- 优雅降级机制
- 详细错误日志

### 3. 文件处理
- 图片压缩和优化
- 临时文件自动清理
- 文件大小限制

## 故障排除

### 常见问题

1. **构建失败**
   - 检查TypeScript类型错误
   - 确认所有依赖已正确安装
   - 检查环境变量配置

2. **OCR识别失败**
   - 确认Google Vision API配置
   - 检查图片质量和格式
   - 查看API配额限制

3. **AI分析失败**
   - 确认OpenAI API密钥
   - 检查API配额和限制
   - 查看网络连接状态

4. **数据库连接失败**
   - 确认DATABASE_URL格式正确
   - 检查数据库服务状态
   - 验证网络连接

## 当前状态

✅ **OCR服务**: 已集成百度OCR API，支持真实的图片文字识别
✅ **AI分析服务**: 已集成DeepSeek API，支持真实的配料健康度分析

### OCR服务配置
- 已集成百度OCR API
- 支持令牌缓存机制
- 自动处理API认证
- 提供详细的错误处理

### AI分析服务配置
- 已集成DeepSeek API
- 智能提示词工程
- JSON结构化输出
- 降级分析机制
- 完善的错误处理

### 配置DeepSeek API
要启用DeepSeek AI分析，请：
1. 获取DeepSeek API密钥
2. 在 `.env.local` 中配置 `DEEPSEEK_API_KEY=your-api-key`
3. 重启开发服务器

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请创建Issue或联系开发团队。