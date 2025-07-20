-- 食品安全检测系统数据库设计
-- 适用于 Neon Postgres 数据库

-- 任务表 - 存储检测任务的基本信息和状态
CREATE TABLE detection_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
    progress INTEGER DEFAULT 0, -- 进度百分比 0-100
    image_url TEXT, -- 上传的图片URL
    image_filename VARCHAR(255), -- 原始文件名
    image_size INTEGER, -- 文件大小（字节）
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT, -- 错误信息（如果失败）
    processing_step VARCHAR(50) -- 当前处理步骤: upload, ocr, analysis, completed
);

-- OCR识别结果表 - 存储OCR提取的配料信息
CREATE TABLE ocr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES detection_tasks(id) ON DELETE CASCADE,
    raw_text TEXT, -- OCR识别的原始文本
    extracted_ingredients JSONB, -- 提取的配料信息（JSON格式）
    confidence_score DECIMAL(3,2), -- OCR置信度分数
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 健康分析结果表 - 存储大模型分析的健康度评分
CREATE TABLE health_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES detection_tasks(id) ON DELETE CASCADE,
    overall_score INTEGER CHECK (overall_score >= 1 AND overall_score <= 10), -- 总体健康度评分 1-10
    ingredient_scores JSONB, -- 每个配料的详细评分（JSON格式）
    analysis_report TEXT, -- 详细分析报告
    recommendations TEXT, -- 健康建议
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_detection_tasks_status ON detection_tasks(status);
CREATE INDEX idx_detection_tasks_created_at ON detection_tasks(created_at);
CREATE INDEX idx_ocr_results_task_id ON ocr_results(task_id);
CREATE INDEX idx_health_analysis_task_id ON health_analysis(task_id);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为任务表添加自动更新时间戳触发器
CREATE TRIGGER update_detection_tasks_updated_at
    BEFORE UPDATE ON detection_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 示例数据结构说明：

-- extracted_ingredients JSON 格式示例：
-- {
--   "ingredients": [
--     {"name": "白砂糖", "position": 1},
--     {"name": "小麦粉", "position": 2},
--     {"name": "植物油", "position": 3}
--   ],
--   "has_ingredients": true,
--   "extraction_confidence": 0.95
-- }

-- ingredient_scores JSON 格式示例：
-- {
--   "scores": [
--     {
--       "ingredient": "白砂糖",
--       "score": 3,
--       "reason": "高糖分，过量摄入可能导致肥胖和糖尿病风险",
--       "category": "添加糖"
--     },
--     {
--       "ingredient": "小麦粉",
--       "score": 7,
--       "reason": "提供碳水化合物和蛋白质，但缺乏纤维",
--       "category": "主要成分"
--     }
--   ]
-- }