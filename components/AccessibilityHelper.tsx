// components/AccessibilityHelper.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface AccessibilityContextType {
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  toggleHighContrast: () => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')

  useEffect(() => {
    // 检查本地存储中的设置
    const savedHighContrast = localStorage.getItem('highContrast') === 'true'
    const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large' || 'medium'
    
    setHighContrast(savedHighContrast)
    setFontSize(savedFontSize)
  }, [])

  useEffect(() => {
    // 应用高对比度模式
    if (highContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
    
    // 保存到本地存储
    localStorage.setItem('highContrast', highContrast.toString())
  }, [highContrast])

  useEffect(() => {
    // 应用字体大小
    document.body.className = document.body.className.replace(/font-size-\w+/g, '')
    document.body.classList.add(`font-size-${fontSize}`)
    
    // 保存到本地存储
    localStorage.setItem('fontSize', fontSize)
  }, [fontSize])

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
  }

  return (
    <AccessibilityContext.Provider value={{
      highContrast,
      fontSize,
      toggleHighContrast,
      setFontSize
    }}>
      {children}
    </AccessibilityContext.Provider>
  )
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider')
  }
  return context
}

export const AccessibilityControls: React.FC = () => {
  const { highContrast, fontSize, toggleHighContrast, setFontSize } = useAccessibility()

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 border border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-2">无障碍设置</h3>
      <div className="space-y-3">
        <button
          onClick={toggleHighContrast}
          className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
            highContrast 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {highContrast ? '✓ 高对比度开启' : '高对比度'}
        </button>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">字体大小</label>
          <div className="flex space-x-2">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`flex-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                  fontSize === size
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                {size === 'small' ? '小' : size === 'medium' ? '中' : '大'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}