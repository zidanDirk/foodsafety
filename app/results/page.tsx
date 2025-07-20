'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// 结果数据类型定义
interface AnalysisResult {
  taskId: string
  status: string
  result?: {
    ocrData: {
      rawText: string
      extractedIngredients: {
        ingredients: Array<{ name: string; position: number }>
        hasIngredients: boolean
        extractionConfidence: number
      }
      confidence: number
    }
    healthAnalysis: {
      overallScore: number
      ingredientScores: {
        scores?: Array<{
          ingredient: string
          score: number
          reason: string
          category: string
          healthImpact?: string
        }>
        ingredientScores?: Array<{
          ingredient: string
          score: number
          reason: string
          category: string
          healthImpact?: string
        }>
        message?: string
      } | Array<{
        ingredient: string
        score: number
        reason: string
        category: string
        healthImpact?: string
      }>
      analysisReport: string
      recommendations: string
    }
  }
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const taskId = searchParams?.get('taskId')

  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!taskId) {
      setError('缺少任务ID')
      setLoading(false)
      return
    }

    fetchResult()
  }, [taskId])

  const fetchResult = async () => {
    try {
      const response = await fetch(`/api/task-status?taskId=${taskId}`)
      if (!response.ok) {
        throw new Error('获取结果失败')
      }

      const data: AnalysisResult = await response.json()

      if (data.status !== 'completed') {
        setError('任务尚未完成或已失败')
      } else {
        setResult(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取结果失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取健康度评分的颜色
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600'
    if (score >= 6) return 'text-yellow-600'
    if (score >= 4) return 'text-orange-600'
    return 'text-red-600'
  }

  // 获取健康度评分的背景色
  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-green-100'
    if (score >= 6) return 'bg-yellow-100'
    if (score >= 4) return 'bg-orange-100'
    return 'bg-red-100'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载结果...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">获取结果失败</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
              <div className="space-x-4">
                <button
                  onClick={fetchResult}
                  className="btn-primary"
                >
                  重试
                </button>
                <Link href="/detection" className="btn-secondary">
                  重新检测
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!result || !result.result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">暂无结果</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">未找到检测结果</p>
              <Link href="/detection" className="btn-primary">
                重新检测
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 安全地解构数据，提供默认值
  const ocrData = result.result.ocrData || {}
  const healthAnalysis = result.result.healthAnalysis || {}
  const hasIngredients = ocrData.extractedIngredients?.hasIngredients || false
  const ingredients = ocrData.extractedIngredients?.ingredients || []

  // 添加详细的调试信息
  console.log('Complete result object:', JSON.stringify(result, null, 2))
  console.log('OCR Data:', ocrData)
  console.log('Health Analysis:', healthAnalysis)
  console.log('Health Analysis keys:', Object.keys(healthAnalysis))
  console.log('Health Analysis type:', typeof healthAnalysis)

  // 如果healthAnalysis为空，显示错误信息
  if (!healthAnalysis || Object.keys(healthAnalysis).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">分析结果不完整</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">健康度分析数据缺失，请重新检测</p>
              <Link href="/detection" className="btn-primary">
                重新检测
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 正确获取配料评分数据 - 安全处理多种可能的数据结构
  const getIngredientScores = () => {
    // 安全检查 healthAnalysis 是否存在
    if (!healthAnalysis || typeof healthAnalysis !== 'object') {
      console.warn('healthAnalysis is not available or not an object')
      return []
    }

    const ingredientScores = healthAnalysis.ingredientScores

    // 如果 ingredientScores 本身就是数组
    if (Array.isArray(ingredientScores)) {
      return ingredientScores
    }

    // 如果是对象，尝试获取嵌套的数组
    if (ingredientScores && typeof ingredientScores === 'object') {
      return (ingredientScores as any).ingredientScores ||
             (ingredientScores as any).scores ||
             []
    }

    // 如果都没有，返回空数组
    console.warn('No valid ingredient scores found in healthAnalysis')
    return []
  }

  const scores = getIngredientScores()

  // 安全获取总体评分
  const getOverallScore = () => {
    if (!healthAnalysis || typeof healthAnalysis.overallScore !== 'number') {
      return 5 // 默认评分
    }
    return healthAnalysis.overallScore
  }

  const overallScore = getOverallScore()

  console.log('Health Analysis:', healthAnalysis)
  console.log('Ingredient Scores:', scores)
  console.log('Overall Score:', overallScore)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 导航 */}
          <div className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
              ← 返回首页
            </Link>
          </div>

          {/* 总体评分卡片 */}
          <div className="card p-8 mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-100 dark:border-gray-600">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center justify-center">
                <svg className="w-8 h-8 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                食品安全检测结果
              </h1>

              {hasIngredients ? (
                <div className="flex flex-col lg:flex-row items-center justify-center space-y-6 lg:space-y-0 lg:space-x-12">
                  {/* 评分圆环 */}
                  <div className="text-center">
                    <div className="relative inline-block mb-4">
                      {/* 背景圆环 */}
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="8"
                          className="text-gray-200 dark:text-gray-600"
                        />
                        {/* 进度圆环 */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          strokeWidth="8"
                          strokeLinecap="round"
                          className={
                            overallScore >= 8 ? 'text-green-500' :
                            overallScore >= 6 ? 'text-yellow-500' :
                            overallScore >= 4 ? 'text-orange-500' :
                            'text-red-500'
                          }
                          stroke="currentColor"
                          strokeDasharray={`${(overallScore / 10) * 314} 314`}
                          style={{
                            transition: 'stroke-dasharray 1s ease-in-out'
                          }}
                        />
                      </svg>

                      {/* 评分数字 */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-24 h-24 rounded-full ${getScoreBgColor(overallScore)} flex items-center justify-center shadow-lg`}>
                          <span className={`text-3xl font-bold ${getScoreColor(overallScore)}`}>
                            {overallScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xl font-semibold text-gray-900 dark:text-white">总体健康度</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">满分10分</p>

                    {/* 健康度描述 */}
                    <div className="mt-4 p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                      <p className={`text-sm font-medium ${getScoreColor(overallScore)}`}>
                        {overallScore >= 8 ? '健康食品 - 推荐食用' :
                         overallScore >= 6 ? '中等健康 - 适量食用' :
                         overallScore >= 4 ? '需要注意 - 谨慎食用' :
                         '不够健康 - 建议避免'}
                      </p>
                    </div>
                  </div>

                  {/* 评分标准说明 */}
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">评分标准</h3>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">8-10分：健康食品，营养丰富</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">6-7分：中等健康，适量食用</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">4-5分：需要注意，谨慎食用</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">1-3分：不够健康，建议避免</span>
                      </div>
                    </div>

                    {/* 配料统计 */}
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">检测到配料</span>
                        <span className="font-medium text-gray-900 dark:text-white">{ingredients.length} 种</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-400">分析完成度</span>
                        <span className="font-medium text-green-600">100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">未检测到配料信息</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">图片中未能识别到配料表内容</p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      建议：确保图片清晰，包含完整的配料表信息，然后重新检测
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 配料详情 */}
          {hasIngredients && ingredients.length > 0 && (
            <div className="card p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                配料详情分析
              </h2>

              {Array.isArray(scores) && scores.length > 0 ? (
                <div className="grid gap-6">
                  {scores.map((score, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                      {/* 配料头部信息 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mr-3">
                              {score.ingredient || `配料 ${index + 1}`}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {score.category || '未分类'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">健康度评分：</span>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${getScoreBgColor(score.score || 5)} ${getScoreColor(score.score || 5)}`}>
                              {score.score || 5}/10
                            </div>
                          </div>
                        </div>

                        {/* 评分可视化 */}
                        <div className="ml-4">
                          <div className="flex items-center space-x-1">
                            {[...Array(10)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-6 rounded-sm ${
                                  i < (score.score || 5)
                                    ? score.score >= 8
                                      ? 'bg-green-500'
                                      : score.score >= 6
                                      ? 'bg-yellow-500'
                                      : score.score >= 4
                                      ? 'bg-orange-500'
                                      : 'bg-red-500'
                                    : 'bg-gray-200 dark:bg-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 评分原因 */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">评分原因</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                          {score.reason || '暂无详细说明'}
                        </p>
                      </div>

                      {/* 健康影响 */}
                      {score.healthImpact && (
                        <div className="border-t border-gray-100 dark:border-gray-600 pt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                            <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            健康影响
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {score.healthImpact}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">暂无配料详情</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    配料分析数据不完整，请重新检测或联系技术支持
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 分析报告 */}
          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              详细分析报告
            </h2>
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-green-200 dark:border-gray-600">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed">
                  {healthAnalysis.analysisReport || '分析报告生成中...'}
                </div>
              </div>
            </div>
          </div>

          {/* 健康建议 */}
          <div className="card p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              专业健康建议
            </h2>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">营养师建议</h3>
                  <div className="whitespace-pre-line text-blue-800 dark:text-blue-200 leading-relaxed">
                    {healthAnalysis.recommendations || '建议生成中...'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OCR信息（调试用，可选显示） */}
          <div className="card p-8 mb-8">
            <details className="group">
              <summary className="cursor-pointer text-lg font-semibold text-gray-900 dark:text-white mb-4 group-open:mb-6">
                技术详情
                <span className="ml-2 text-sm text-gray-500">(点击展开)</span>
              </summary>
              <div className="space-y-4">
                {/* <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">OCR识别置信度</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {(ocrData.confidence * 100).toFixed(1)}%
                  </p>
                </div> */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">配料提取置信度</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {(ocrData.extractedIngredients.extractionConfidence * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">识别的原始文本</h4>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm text-gray-700 dark:text-gray-300 max-h-40 overflow-y-auto">
                    {ocrData.rawText || '无文本内容'}
                  </div>
                </div>
              </div>
            </details>
          </div>

          {/* 操作按钮 */}
          <div className="text-center space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Link
              href="/detection"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新检测
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首页
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在加载结果...</p>
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  )
}