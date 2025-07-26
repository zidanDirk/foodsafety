'use client'

import { useRouter } from 'next/navigation'

export default function ResultsPage() {
  const router = useRouter()

  // 模拟分析结果
  const mockResult = {
    ocrData: {
      rawText: '配料：小麦粉、白砂糖、植物油、鸡蛋、食用盐',
      extractedIngredients: {
        ingredients: [
          { name: '小麦粉', position: 1 },
          { name: '白砂糖', position: 2 },
          { name: '植物油', position: 3 },
          { name: '鸡蛋', position: 4 },
          { name: '食用盐', position: 5 }
        ]
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
        }
      ],
      analysisReport: '本产品包含 5 种配料。总体健康度评分为 6/10 分，属于中等健康水平。',
      recommendations: '1. 适量食用，避免过量摄入糖分\n2. 搭配水果或牛奶食用，增加营养价值'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              分析结果
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <div className={`text-4xl font-bold ${getScoreColor(mockResult.healthAnalysis.overallScore)}`}>
                {mockResult.healthAnalysis.overallScore}/10
              </div>
              <div className="text-gray-600">总体健康度评分</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">识别到的配料</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700">{mockResult.ocrData.rawText}</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {mockResult.ocrData.extractedIngredients.ingredients.map((ingredient, index) => (
                <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {ingredient.name}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">配料健康度评分</h2>
            <div className="space-y-4">
              {mockResult.healthAnalysis.ingredientScores.map((item, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900">{item.ingredient}</h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBackground(item.score)} ${getScoreColor(item.score)}`}>
                      {item.score}/10
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-1">{item.reason}</p>
                  <div className="flex space-x-2 text-xs">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">{item.category}</span>
                    <span className={`px-2 py-1 rounded ${
                      item.healthImpact === '对健康有益' ? 'bg-green-100 text-green-700' :
                      item.healthImpact === '需要注意' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {item.healthImpact}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">分析报告</h2>
            <p className="text-gray-700">{mockResult.healthAnalysis.analysisReport}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">健康建议</h2>
            <p className="text-gray-700 whitespace-pre-line">{mockResult.healthAnalysis.recommendations}</p>
          </div>

          <div className="text-center space-x-4">
            <button
              onClick={() => router.push('/detection')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              检测新图片
            </button>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
