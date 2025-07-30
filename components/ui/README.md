# UI组件库使用文档

本文档介绍了食品安全检测系统中使用的自定义UI组件库。

## 组件列表

### 1. Button 按钮组件

按钮组件用于触发操作，支持多种样式和尺寸。

**Props:**
- `variant`: 按钮样式 - 'primary' | 'secondary' | 'outline' | 'ghost' (默认: 'primary')
- `size`: 按钮尺寸 - 'sm' | 'md' | 'lg' (默认: 'md')
- `isLoading`: 是否显示加载状态 (默认: false)
- `fullWidth`: 是否占满容器宽度 (默认: false)
- 所有原生button元素的属性

**使用示例:**
```tsx
import { Button } from '@/components/ui/Button'

// 主要按钮
<Button variant="primary">主要操作</Button>

// 次要按钮
<Button variant="secondary">次要操作</Button>

// 加载状态
<Button isLoading>提交中...</Button>

// 大尺寸按钮
<Button size="lg">大按钮</Button>
```

### 2. Card 卡片组件

卡片组件用于组织相关内容，提供一致的视觉容器。

**Props:**
- `title`: 卡片标题
- `description`: 卡片描述
- 所有原生div元素的属性

**使用示例:**
```tsx
import { Card } from '@/components/ui/Card'

// 基础卡片
<Card>
  <p>卡片内容</p>
</Card>

// 带标题的卡片
<Card title="分析结果" description="食品安全检测的详细分析">
  <p>卡片内容</p>
</Card>
```

### 3. LoadingSpinner 加载指示器

加载指示器用于显示异步操作的加载状态。

**Props:**
- `size`: 尺寸 - 'sm' | 'md' | 'lg' (默认: 'md')
- `className`: 自定义CSS类名

**使用示例:**
```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

// 默认尺寸
<LoadingSpinner />

// 大尺寸
<LoadingSpinner size="lg" />

// 自定义样式
<LoadingSpinner className="my-4" />
```

## 设计原则

1. **一致性**: 所有组件遵循统一的设计语言
2. **可访问性**: 组件支持键盘导航和屏幕阅读器
3. **响应式**: 组件在不同屏幕尺寸下都能良好显示
4. **可复用**: 组件设计为通用模块，可在多个地方使用

## 主题和样式

组件使用Tailwind CSS进行样式设计，支持以下主题变量：
- 主要颜色: blue-600 到 indigo-700 渐变
- 次要颜色: gray-600 到 gray-700 渐变
- 成功颜色: green-100 到 green-800
- 警告颜色: yellow-100 到 yellow-800
- 错误颜色: red-100 到 red-800

## 可访问性

所有组件都遵循WCAG 2.1 AA标准：
- 正确的对比度比率
- 键盘导航支持
- ARIA标签和角色
- 焦点管理

## 响应式设计

组件使用Tailwind的响应式工具类，在以下断点进行适配：
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px