# 食品安全检测系统

## 项目简介
这是一个基于Next.js的食品安全检测系统，主要功能包括：
- 图片上传与存储
- 食品标签OCR识别
- 食品安全信息查询

## 技术栈
- Next.js 14
- TypeScript
- Tailwind CSS
- 百度OCR API

## 环境变量配置
项目需要以下环境变量：
- BAIDU_OCR_API_KEY - 百度OCR API Key
- BAIDU_OCR_SECRET_KEY - 百度OCR Secret Key
- NEXT_PUBLIC_API_BASE_URL - API基础URL (开发环境默认localhost:3000)

## 安装与运行
1. 安装依赖：
```bash
pnpm install
```

2. 运行开发服务器：
```bash
pnpm run dev
```

3. 构建生产版本：
```bash
pnpm run build
```

## 项目结构
主要目录说明：
- `app/` - Next.js应用路由
- `src/` - 客户端组件和状态管理
- `public/` - 静态资源
- `config/` - 配置文件


## model name

- gemini-2.5-flash
- deepseek-v3-0324