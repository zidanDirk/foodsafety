import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { taskId } = req.query

  if (!taskId) {
    return res.status(400).json({ error: '缺少taskId参数' })
  }

  // 返回模拟的完成结果
  const mockResult = {
    taskId,
    status: 'completed',
    progress: 100,
    processingStep: '分析完成',
    result: {
      ocrData: {
        success: true,
        rawText: '配料：小麦粉、白砂糖、植物油、鸡蛋、食用盐、碳酸氢钠、食用香精',
        confidence: 0.85,
        extractedIngredients: {
          ingredients: [
            { name: '小麦粉', position: 1 },
            { name: '白砂糖', position: 2 },
            { name: '植物油', position: 3 },
            { name: '鸡蛋', position: 4 },
            { name: '食用盐', position: 5 }
          ],
          hasIngredients: true,
          extractionConfidence: 0.85
        }
      },
      healthAnalysis: {
        overallScore: 6,
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
          }
        ],
        analysisReport: '本产品包含 5 种配料。总体健康度评分为 6/10 分，属于中等健康水平。\n\n主要优点：含有小麦粉和鸡蛋等营养成分，能提供基本的营养需求。\n\n需要注意：含有白砂糖，建议适量食用。',
        recommendations: '1. 适量食用，避免过量摄入糖分\n2. 搭配水果或牛奶食用，增加营养价值\n3. 选择运动后食用，有助于能量补充'
      }
    }
  }

  res.status(200).json(mockResult)
}
