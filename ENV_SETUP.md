# 环境变量配置指南

## 概述
本项目使用 dotenv 和 Next.js 内置环境变量支持来管理配置。

## 环境变量文件
项目根目录下的 `.env` 文件包含所有必要的环境变量：

```env
# 百度OCR API配置
BAIDU_OCR_API_KEY=your_baidu_ocr_api_key
BAIDU_OCR_SECRET_KEY=your_baidu_ocr_secret_key

# API基础URL配置
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000

# LLM API KEY
LLM_API_KEY=your_llm_api_key

# Neon数据库连接字符串
DATABASE_URL="postgresql://username:password@host/database?sslmode=require&channel_binding=require"
```

## 配置说明

### 1. Next.js 配置 (next.config.js)
```javascript
const nextConfig = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    BAIDU_OCR_API_KEY: process.env.BAIDU_OCR_API_KEY,
    BAIDU_OCR_SECRET_KEY: process.env.BAIDU_OCR_SECRET_KEY,
    LLM_API_KEY: process.env.LLM_API_KEY,
  },
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
}
```

### 2. 数据库连接 (src/lib/db.ts)
```typescript
// Next.js 自动加载 .env 文件
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined. Please check your .env file.');
}
```

### 3. Drizzle 配置 (drizzle.config.ts)
```typescript
export default {
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

## 部署到 Netlify

### 1. 环境变量设置
在 Netlify 控制台中设置以下环境变量：
- `DATABASE_URL`: Neon 数据库连接字符串
- `BAIDU_OCR_API_KEY`: 百度OCR API密钥
- `BAIDU_OCR_SECRET_KEY`: 百度OCR密钥
- `LLM_API_KEY`: LLM API密钥

### 2. 构建设置
- Build command: `pnpm run build`
- Publish directory: `.next`
- Node.js version: 18.x 或更高

## 验证环境变量
运行以下命令验证环境变量是否正确加载：

```bash
# 启动开发服务器
pnpm run dev

# 测试数据库连接
curl http://localhost:3000/api/stats

# 测试数据库推送
pnpm run db:push
```

## 故障排除

### 1. 模块未找到错误
如果遇到 "Module not found: Can't resolve 'drizzle-orm'" 错误：
```bash
pnpm add @neondatabase/serverless drizzle-orm drizzle-kit
```

### 2. 数据库连接失败
- 检查 DATABASE_URL 格式是否正确
- 确保 Neon 数据库实例正在运行
- 验证网络连接

### 3. 环境变量未加载
- 确保 .env 文件在项目根目录
- 重启开发服务器
- 检查 next.config.js 配置

## 安全注意事项
- 不要将 .env 文件提交到版本控制
- 在生产环境中使用安全的环境变量管理
- 定期轮换 API 密钥
