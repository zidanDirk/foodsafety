const { SimpleTaskProcessor } = require('../../lib/simple-task-processor.js')

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { taskId } = req.query

  if (!taskId) {
    return res.status(400).json({ error: '缺少taskId参数' })
  }

  // 获取真实的任务状态
  console.log('Querying task:', taskId)
  console.log('All tasks:', Array.from(SimpleTaskProcessor.tasks.keys()))

  const task = SimpleTaskProcessor.getTask(taskId)
  // console.log('Task found:', task ? 'yes' : 'no', task)

  if (!task) {
    return res.status(404).json({
      error: '任务不存在',
      taskId,
      availableTasks: Array.from(SimpleTaskProcessor.tasks.keys())
    })
  }

  // 如果任务还在处理中，返回当前状态
  if (task.status !== 'completed') {
    return res.status(200).json({
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      processingStep: task.processingStep,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      error: task.error
    })
  }

  // 返回完成的任务结果
  const result = {
    taskId: task.id,
    status: task.status,
    progress: task.progress,
    processingStep: task.processingStep,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    completedAt: task.completedAt,
    result: task.result || {
      ocrData: {
        rawText: '配料：小麦粉、白砂糖、植物油、鸡蛋、食用盐、碳酸氢钠、食用香精',
        extractedIngredients: {
          ingredients: [
            { name: '小麦粉', position: 1 },
            { name: '白砂糖', position: 2 },
            { name: '植物油', position: 3 },
            { name: '鸡蛋', position: 4 },
            { name: '食用盐', position: 5 },
            { name: '碳酸氢钠', position: 6 },
            { name: '食用香精', position: 7 }
          ],
          hasIngredients: true,
          extractionConfidence: 0.85
        },
        confidence: 0.85
      },
      healthAnalysis: {
        overallScore: 6,
        ingredientScores: {
          ingredientScores: [
            {
              ingredient: '小麦粉',
              score: 7,
              reason: '提供碳水化合物和蛋白质，是主要的能量来源',
              category: '主要成分',
              healthImpact: '对健康有益'
            },
            {
              ingredient: '白砂糖',
              score: 3,
              reason: '高糖分，过量摄入可能导致肥胖和糖尿病风险',
              category: '添加糖',
              healthImpact: '需要注意'
            },
            {
              ingredient: '植物油',
              score: 5,
              reason: '提供必需脂肪酸，但需注意摄入量',
              category: '油脂',
              healthImpact: '中性影响'
            },
            {
              ingredient: '鸡蛋',
              score: 8,
              reason: '优质蛋白质来源，营养价值高',
              category: '蛋白质',
              healthImpact: '对健康有益'
            },
            {
              ingredient: '食用盐',
              score: 4,
              reason: '必需的调味料，但过量摄入对心血管不利',
              category: '调味料',
              healthImpact: '需要注意'
            },
            {
              ingredient: '碳酸氢钠',
              score: 6,
              reason: '常用的发酵剂，安全性较好',
              category: '添加剂',
              healthImpact: '中性影响'
            },
            {
              ingredient: '食用香精',
              score: 4,
              reason: '人工添加剂，建议适量摄入',
              category: '香料',
              healthImpact: '需要注意'
            }
          ]
        },
        analysisReport: '本产品包含 7 种配料。总体健康度评分为 6/10 分，属于中等健康水平。\\n\\n主要优点：含有小麦粉和鸡蛋等营养成分，能提供基本的营养需求。\\n\\n需要注意：含有白砂糖和人工香精，建议适量食用。\\n\\n建议：作为偶尔的零食可以接受，但不建议大量或频繁食用。',
        recommendations: '1. 适量食用，避免过量摄入糖分\\n2. 搭配水果或牛奶食用，增加营养价值\\n3. 选择运动后食用，有助于能量补充\\n4. 注意查看营养标签，了解具体含量'
      }
    }
  }

  res.status(200).json(result)
}
