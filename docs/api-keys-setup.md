# API密钥配置指南

## 获取DeepSeek API密钥

### 1. 注册DeepSeek账户
1. 访问 https://platform.deepseek.com/
2. 注册新账户或登录现有账户
3. 完成邮箱验证

### 2. 获取API密钥
1. 登录后进入控制台
2. 点击"API Keys"或"密钥管理"
3. 点击"创建新密钥"
4. 复制生成的API密钥

### 3. 配置环境变量
在项目根目录的 `.env.local` 文件中添加：
```env
DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 获取百度OCR API密钥

### 1. 注册百度智能云
1. 访问 https://cloud.baidu.com/
2. 注册账户并完成实名认证

### 2. 创建OCR应用
1. 进入"产品服务" → "人工智能" → "文字识别OCR"
2. 点击"立即使用"
3. 创建应用，选择"通用文字识别"
4. 获取API Key和Secret Key

### 3. 配置环境变量
```env
BAIDU_OCR_API_KEY=your-api-key
BAIDU_OCR_SECRET_KEY=your-secret-key
```

## 配置数据库连接

### 1. 创建Neon数据库
1. 访问 https://console.neon.tech/
2. 注册账户并创建新项目
3. 获取数据库连接字符串

### 2. 配置环境变量
```env
DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
```

## 完整的环境变量配置

创建 `.env.local` 文件：
```env
# 数据库配置
DATABASE_URL="your-neon-database-url"

# 百度OCR API配置
BAIDU_OCR_API_KEY=your-baidu-api-key
BAIDU_OCR_SECRET_KEY=your-baidu-secret-key

# DeepSeek API配置
DEEPSEEK_API_KEY=your-deepseek-api-key

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
MAX_FILE_SIZE=8388608
```