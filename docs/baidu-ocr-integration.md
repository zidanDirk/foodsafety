# 百度OCR API集成说明

## 功能特性

✅ **已完成的功能**:
- 百度OCR API集成
- 访问令牌自动管理和缓存
- 图片base64编码处理
- 置信度评分计算
- 完善的错误处理机制

## 技术实现

### 1. 令牌管理
- 自动获取和缓存访问令牌
- 令牌过期前5分钟自动刷新
- 避免频繁的认证请求

### 2. API调用
- 使用百度OCR高精度版本 (`accurate_basic`)
- 支持置信度返回
- 自动处理图片格式转换

### 3. 结果处理
- 智能文本行合并
- 置信度平均值计算
- 结构化数据返回

## 配置说明

### 环境变量
```env
# 百度OCR API配置
BAIDU_OCR_API_KEY=your-api-key
BAIDU_OCR_SECRET_KEY=your-secret-key
```

### API参数
- `detect_direction`: false - 不检测文字方向
- `paragraph`: false - 不返回段落信息
- `probability`: true - 返回置信度
- `multidirectional_recognize`: false - 不进行多方向识别

## 代码结构

### 核心方法

1. **getAccessToken()** - 令牌管理
   - 缓存机制
   - 自动刷新
   - 错误处理

2. **extractText()** - 文本提取
   - 图片处理
   - API调用
   - 结果解析

3. **processOCRResult()** - 结果处理
   - 文本合并
   - 置信度计算
   - 数据标准化

## 使用示例

```typescript
import { OCRService } from '@/lib/ocr-service'

// 提取图片中的文字
const result = await OCRService.extractText(imageBuffer)
console.log('识别文本:', result.text)
console.log('置信度:', result.confidence)
```