'use client';

import React from 'react';
import Button from '../src/components/Button';
import UserInfo from '../src/components/UserInfo';

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto">
      <UserInfo />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)] py-8 px-4">
        <h1 className="text-5xl font-bold text-primary mb-6 text-center leading-tight">
          欢迎来到 🍏 食品安全检测系统
        </h1>
        <p className="text-xl text-text mb-8 text-center max-w-prose">
          我们致力于让您的食品更安全，通过智能图片识别技术，快速检测食品中的潜在风险。
        </p>
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Button variant="primary" href="/upload" className="w-full sm:w-auto">
            📸 图片上传
          </Button>
          <Button variant="secondary" href="/about" className="w-full sm:w-auto">
            📖 了解更多
          </Button>
        </div>
      </div>
    </div>
  );
}
