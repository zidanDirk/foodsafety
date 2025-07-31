import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AccessibilityProvider } from '@/components/AccessibilityHelper'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '食品安全检测系统',
  description: '基于Next.js构建，部署在Netlify平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ErrorBoundary>
          <AccessibilityProvider>
            {children}
          </AccessibilityProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
