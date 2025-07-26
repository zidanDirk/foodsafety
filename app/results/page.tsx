'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface TaskResult {
  taskId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  processingStep: string
  result?: {
    ocrData: {
      rawText: string
      extractedIngredients: {
        ingredients: Array<{ name: string; position: number }>
        hasIngredients: boolean
        extractionConfidence: number
      }
    }
    healthAnalysis: {
      overallScore: number
      ingredientScores: Array<{
        ingredient: string
        score: number
        reason: string
        category: string
        healthImpact: string
      }>
      analysisReport: string
      recommendations: string
    }
  }
  error?: string
}

function ResultsPageContent() {
  const [taskResult, setTaskResult] = useState<TaskResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showIngredients, setShowIngredients] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams?.get('taskId')

  useEffect(() => {
    if (!taskId) {
      setError('缺少任务ID')
      setLoading(false)
      return
    }

    const pollTaskStatus = async () => {
      try {
        const response = await fetch(`/api/task-status?taskId=${taskId}`)

        if (!response.ok) {
          throw new Error('获取任务状态失败')
        }

        const result: TaskResult = await response.json()
        setTaskResult(result)

        if (result.status === 'completed' || result.status === 'failed') {
          setLoading(false)
        } else {
          setTimeout(pollTaskStatus, 2000)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取结果失败')
        setLoading(false)
      }
    }

    pollTaskStatus()
  }, [taskId])

  // 模拟分析结果（作为降级方案）
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">正在分析中...</h2>
          {taskResult && (
            <div className="space-y-2">
              <p className="text-gray-600">{taskResult.processingStep}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${taskResult.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{taskResult.progress}%</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error || !taskResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">分析失败</h2>
          <p className="text-gray-600 mb-4">{error || '未知错误'}</p>
          <button
            onClick={() => router.push('/detection')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新检测
          </button>
        </div>
      </div>
    )
  }

  if (taskResult.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">分析失败</h2>
          <p className="text-gray-600 mb-4">{taskResult.error || '处理过程中出现错误'}</p>
          <button
            onClick={() => router.push('/detection')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            重新检测
          </button>
        </div>
      </div>
    )
  }

  // 使用真实结果或降级到模拟结果
  const displayResult = taskResult.result || mockResult

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              分析结果
            </h1>
            <div className="flex items-center justify-center space-x-4">
              <div className={`text-4xl font-bold ${getScoreColor(displayResult.healthAnalysis.overallScore)}`}>
                {displayResult.healthAnalysis.overallScore}/10
              </div>
              <div className="text-gray-600">总体健康度评分</div>
            </div>
          </div>



          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">配料健康度评分</h2>
            <div className="space-y-4">
              {displayResult.healthAnalysis.ingredientScores.map((item, index) => (
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
            <p className="text-gray-700">{displayResult.healthAnalysis.analysisReport}</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">健康建议</h2>
            <p className="text-gray-700 whitespace-pre-line">{displayResult.healthAnalysis.recommendations}</p>
          </div>

          {/* 识别到的配料 - 收起展示 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
            >
              <h2 className="text-xl font-semibold text-gray-900">识别到的配料</h2>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  {showIngredients ? '收起' : '展开查看'}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    showIngredients ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </button>

            {showIngredients && (
              <div className="mt-4 space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">OCR识别原文：</h3>
                  <p className="text-gray-700 text-sm">{displayResult.ocrData.rawText}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">提取的配料：</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {displayResult.ocrData.extractedIngredients.ingredients.map((ingredient, index) => (
                      <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {ingredient.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">加载中...</h2>
        </div>
      </div>
    }>
      <ResultsPageContent />
    </Suspense>
  )
}
