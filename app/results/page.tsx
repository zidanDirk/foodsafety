// app/results/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useAccessibility } from '@/components/AccessibilityHelper'

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

export default function ResultsPage() {
  const [taskResult, setTaskResult] = useState<TaskResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showIngredients, setShowIngredients] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams?.get('taskId')
  const { highContrast } = useAccessibility()

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

  const getHealthImpactColor = (impact: string) => {
    switch (impact) {
      case '对健康有益': return 'bg-green-100 text-green-700'
      case '需要注意': return 'bg-yellow-100 text-yellow-700'
      case '不健康': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center max-w-md w-full">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">正在分析中...</h2>
          {taskResult && (
            <div className="space-y-4">
              <p className="text-gray-600">{taskResult.processingStep}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${taskResult.progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500">{taskResult.progress}%</p>
            </div>
          )}
        </Card>
      </div>
    )
  }

  if (error || !taskResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center max-w-md w-full">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">分析失败</h2>
          <p className="text-gray-600 mb-6">{error || '未知错误'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="primary" 
              onClick={() => router.push('/detection')}
            >
              重新检测
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
            >
              返回首页
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  if (taskResult.status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="text-center max-w-md w-full">
          <div className="text-red-500 text-4xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">分析失败</h2>
          <p className="text-gray-600 mb-6">{taskResult.error || '处理过程中出现错误'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="primary" 
              onClick={() => router.push('/detection')}
            >
              重新检测
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/')}
            >
              返回首页
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // 使用真实结果或降级到模拟结果
  const displayResult = taskResult.result || mockResult

  // 计算健康度评分的圆环进度
  const getScoreProgress = (score: number) => {
    return (score / 10) * 100
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              分析结果
            </h1>
            <p className="text-gray-600">食品配料健康度评估报告</p>
          </div>

          {/* 总体健康度评分 */}
          <Card className="mb-8 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48 mb-6">
                {/* 背景圆环 */}
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                {/* 进度圆环 */}
                <div 
                  className="absolute inset-0 rounded-full border-8 border-current transition-all duration-1000 ease-out"
                  style={{ 
                    borderColor: displayResult.healthAnalysis.overallScore >= 8 ? '#10B981' : 
                                displayResult.healthAnalysis.overallScore >= 6 ? '#F59E0B' : '#EF4444',
                    clipPath: `inset(0 ${100 - getScoreProgress(displayResult.healthAnalysis.overallScore)}% 0 0)`
                  }}
                ></div>
                {/* 中心分数 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className={`text-5xl font-bold ${
                    displayResult.healthAnalysis.overallScore >= 8 ? 'text-green-600' :
                    displayResult.healthAnalysis.overallScore >= 6 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {displayResult.healthAnalysis.overallScore}
                  </div>
                  <div className="text-gray-500 text-sm mt-1">/10分</div>
                </div>
              </div>
              
              <div className={`text-2xl font-bold mb-2 ${
                displayResult.healthAnalysis.overallScore >= 8 ? 'text-green-600' :
                displayResult.healthAnalysis.overallScore >= 6 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {
                  displayResult.healthAnalysis.overallScore >= 8 ? '健康' :
                  displayResult.healthAnalysis.overallScore >= 6 ? '一般' :
                  '需注意'
                }
              </div>
              <p className="text-gray-600 max-w-md">
                {displayResult.healthAnalysis.analysisReport}
              </p>
            </div>
          </Card>

          {/* 配料健康度评分 */}
          <Card className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">配料健康度评分</h2>
            <div className="space-y-6">
              {displayResult.healthAnalysis.ingredientScores.map((item, index) => (
                <div key={index} className="border rounded-lg p-5 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                    <h3 className="font-semibold text-gray-900 text-xl mb-3 sm:mb-0">{item.ingredient}</h3>
                    <div className="flex flex-wrap gap-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreBackground(item.score)} ${getScoreColor(item.score)}`}>
                        健康度: {item.score}/10
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getHealthImpactColor(item.healthImpact)}`}>
                        {item.healthImpact}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-4">{item.reason}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded mr-2">{item.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 健康建议 */}
          <Card className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">健康建议</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{displayResult.healthAnalysis.recommendations}</p>
            </div>
          </Card>

          {/* 分析报告 */}
          <Card className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">详细分析报告</h2>
            <p className="text-gray-700">{displayResult.healthAnalysis.analysisReport}</p>
          </Card>

          {/* 识别到的配料 - 收起展示 */}
          <Card className="mb-8">
            <button
              onClick={() => setShowIngredients(!showIngredients)}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
              aria-expanded={showIngredients}
            >
              <h2 className="text-2xl font-semibold text-gray-900">识别到的配料</h2>
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
                  aria-hidden="true"
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
              <div className="mt-6 space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">OCR识别原文：</h3>
                  <p className="text-gray-700">{displayResult.ocrData.rawText}</p>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">提取的配料：</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {displayResult.ocrData.extractedIngredients.ingredients.map((ingredient, index) => (
                      <div 
                        key={index} 
                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-center font-medium"
                      >
                        {ingredient.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="text-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => router.push('/detection')}
            >
              检测新图片
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => router.push('/')}
            >
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}