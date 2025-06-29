'use client';

import Button from '../src/components/Button';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">食品安全管理系统</h1>
      <div className="flex flex-col items-center space-y-4">
        <p className="text-xl">欢迎使用食品安全管理系统</p>
      <div className="flex space-x-4">
        <Button variant="primary" href="/upload">
          图片上传
        </Button>
        <Button variant="primary">
          开始使用
        </Button>
      </div>
      </div>
    </div>
  );
}
