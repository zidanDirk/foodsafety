import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Food Safety Detection System',
  description: 'AI-powered food safety detection and analysis platform',
  keywords: ['food safety', 'AI detection', 'food analysis', 'safety inspection'],
  authors: [{ name: 'Food Safety Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full bg-background text-foreground">
          {children}
        </div>
      </body>
    </html>
  )
}
