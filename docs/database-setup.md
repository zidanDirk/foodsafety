# 数据库设置指南

## 问题描述
当前错误：`relation "detection_tasks" does not exist`

这表示数据库中还没有创建必要的表结构。

## 解决步骤

### 方法1: 使用Neon Console（推荐）

1. **登录Neon Console**
   - 访问 https://console.neon.tech/
   - 登录您的账户

2. **选择您的数据库**
   - 选择您的项目
   - 进入SQL Editor

3. **执行初始化脚本**
   - 复制 `docs/init-database.sql` 文件的全部内容
   - 粘贴到SQL Editor中
   - 点击"Run"执行

### 方法2: 使用psql命令行

如果您有psql客户端：

```bash
# 连接到您的Neon数据库
psql "postgresql://username:password@hostname:port/database"

# 执行初始化脚本
\i docs/init-database.sql
```

### 方法3: 使用数据库管理工具

如果您使用DBeaver、pgAdmin等工具：

1. 连接到您的Neon数据库
2. 打开SQL编辑器
3. 复制并执行 `docs/init-database.sql` 的内容

## 验证设置

执行以下SQL来验证表是否创建成功：

```sql
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('detection_tasks', 'ocr_results', 'health_analysis');

-- 检查表结构
\d detection_tasks
\d ocr_results
\d health_analysis
```

应该看到三个表：
- `detection_tasks`
- `ocr_results`
- `health_analysis`

## 环境变量配置

确保您的 `.env.local` 文件包含正确的数据库连接字符串：

```env
DATABASE_URL=postgresql://username:password@hostname:port/database
```

## 测试连接

创建表后，重新启动开发服务器：

```bash
# 停止当前服务器 (Ctrl+C)
# 然后重新启动
pnpm dev
```

现在尝试上传图片，应该可以正常工作了。