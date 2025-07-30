# 测试配置说明

## 测试框架

本项目使用 Jest 作为测试框架，配合 TypeScript 和 Supertest 进行 API 测试。

## 已安装的测试依赖

- `jest`: 测试框架
- `ts-jest`: TypeScript 支持
- `supertest`: HTTP 断言库
- `node-mocks-http`: 模拟 HTTP 请求和响应
- `@types/jest`: Jest 类型定义
- `@types/supertest`: Supertest 类型定义

## 测试目录结构

```
__tests__/
├── api/                    # API 测试
│   ├── health.test.ts     # 健康检查 API 测试
│   ├── init-db.test.ts    # 数据库初始化 API 测试
│   ├── upload.test.ts     # 图片上传 API 测试
│   └── task-status.test.ts # 任务状态 API 测试
├── integration/           # 集成测试
│   └── task-processing.test.ts # 任务处理流程集成测试
├── test-utils.ts          # 测试工具和模拟数据
└── setup.ts              # 测试环境设置
```

## 运行测试

```bash
# 运行所有测试
npm test

# 监听模式运行测试（开发时使用）
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

## 测试配置

- 测试环境: Node.js
- 超时设置: 30秒
- 支持 TypeScript
- 支持模块别名 (@/*)

## 测试策略

1. **单元测试**: 针对单个函数或模块进行测试
2. **API 测试**: 针对 REST API 端点进行测试
3. **集成测试**: 测试多个模块间的协作

## 环境变量

测试环境使用以下默认配置:
- NODE_ENV=test

数据库和其他服务使用模拟对象进行测试，不需要真实的服务连接。

## 编写测试

1. 在 `__tests__/api/` 目录下为每个 API 端点创建对应的测试文件
2. 使用 `describe` 和 `it` 组织测试用例
3. 使用 `jest.mock()` 模拟外部依赖
4. 使用 `supertest` 或 `node-mocks-http` 模拟 HTTP 请求

## 测试覆盖率

运行 `npm run test:coverage` 可以生成测试覆盖率报告，帮助识别未被测试覆盖的代码。