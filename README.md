# 食品安全检测系统

这是一个基于 Next.js 14 构建的基础项目，配置为部署在 Netlify 平台。

## 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **部署**: Netlify

## 本地开发

1. 安装依赖：
```bash
npm install
# 或
pnpm install
```

2. 启动开发服务器：
```bash
npm run dev
# 或
pnpm dev
```

3. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 构建和部署

### 本地构建
```bash
npm run build
# 或
pnpm build
```

### Netlify 部署

项目已配置好 Netlify 部署：

1. 将代码推送到 GitHub 仓库
2. 在 Netlify 中连接 GitHub 仓库
3. Netlify 会自动检测 `netlify.toml` 配置并部署

## 项目结构

```
├── app/                 # Next.js App Router 目录
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 首页
├── netlify.toml        # Netlify 部署配置
├── package.json        # 项目依赖
├── tailwind.config.js  # Tailwind CSS 配置
└── tsconfig.json       # TypeScript 配置
```

## 环境要求

- Node.js 18+
- npm 或 pnpm

## 许可证

MIT
