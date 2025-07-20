# 部署检查清单

## 部署前准备

### 1. 代码准备
- [ ] 所有功能开发完成
- [ ] TypeScript编译通过 (`pnpm type-check`)
- [ ] 代码已推送到Git仓库
- [ ] 移除调试代码和console.log

### 2. 环境配置
- [ ] 创建生产环境的 `.env` 文件
- [ ] 配置数据库连接字符串
- [ ] 获取并配置API密钥
- [ ] 设置文件大小限制

### 3. 数据库设置
- [ ] 创建Neon Postgres数据库
- [ ] 执行数据库初始化脚本
- [ ] 测试数据库连接
- [ ] 配置数据库备份策略

### 4. API服务配置
- [ ] 申请Google Vision API密钥
- [ ] 申请OpenAI API密钥
- [ ] 测试API服务可用性
- [ ] 配置API配额和限制

## Netlify部署步骤

### 1. 项目配置
- [ ] 确认 `netlify.toml` 配置正确
- [ ] 检查构建命令和发布目录
- [ ] 验证Next.js插件配置

### 2. 环境变量设置
在Netlify Dashboard中配置：
- [ ] `DATABASE_URL`
- [ ] `GOOGLE_CLOUD_PROJECT_ID`
- [ ] `GOOGLE_VISION_API_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `MAX_FILE_SIZE`
- [ ] `NEXT_PUBLIC_APP_URL`

### 3. 构建测试
- [ ] 本地构建测试 (`pnpm build`)
- [ ] 检查构建输出
- [ ] 测试生产模式 (`pnpm start`)

### 4. 部署执行
- [ ] 连接Git仓库到Netlify
- [ ] 配置自动部署分支
- [ ] 触发首次部署
- [ ] 检查部署日志