import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/lib/vconsole'; // 引入vconsole

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '食品安全检测系统',
  description: '食品配料安全检测平台',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
