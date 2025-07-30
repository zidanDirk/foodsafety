// app/page.tsx
'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useAccessibility } from '@/components/AccessibilityHelper'

export default function Home() {
  const { highContrast } = useAccessibility()

  const features = [
    {
      icon: '📸',
      title: '拍照上传',
      description: '拍摄食品包装照片或上传已有图片',
      color: 'blue',
    },
    {
      icon: '🔍',
      title: '智能识别',
      description: 'AI技术自动识别配料成分',
      color: 'green',
    },
    {
      icon: '📊',
      title: '健康分析',
      description: '评估配料健康度并提供专业建议',
      color: 'purple',
    },
  ]

  const benefits = [
    '基于先进AI技术的配料识别',
    '专业的营养师团队支持',
    '完全免费使用',
    '隐私保护，数据安全',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 fade-in">
            食品安全检测系统
          </h1>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            通过AI技术智能识别食品配料，分析健康度，守护您和家人的饮食安全
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* 功能卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                variant="elevated"
                className="text-center card-hover"
              >
                <div className={`bg-${feature.color}-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>

          {/* 主要CTA */}
          <div className="text-center mb-16">
            <Link href="/detection">
              <Button 
                size="lg" 
                className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                立即开始检测
              </Button>
            </Link>
          </div>

          {/* 价值主张 */}
          <Card className="mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">为什么选择我们？</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-green-500 mr-3 text-xl">✓</span>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* 使用指南 */}
          <Card>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">如何使用</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  1
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">上传图片</h3>
                <p className="text-gray-600 text-sm">拍摄或上传食品包装图片</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 text-green-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  2
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">智能分析</h3>
                <p className="text-gray-600 text-sm">AI识别配料并分析健康度</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 text-purple-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                  3
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">获取建议</h3>
                <p className="text-gray-600 text-sm">查看健康建议和注意事项</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}