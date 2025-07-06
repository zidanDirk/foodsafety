'use client';

import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { compressImage } from '@/src/lib/image-utils';
import { toast } from 'react-hot-toast';
import Button from '../../src/components/Button'; // 导入Button组件
import UserInfo from '../../src/components/UserInfo';
import { ingredientItem } from '@/src/types/ingredients';
import { userService } from '../../src/lib/user-service';

type IngredientResult = ingredientItem[];

export default function UploadPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientResult | null>(null);
  const [userInitialized, setUserInitialized] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 初始化用户服务
  useEffect(() => {
    const initializeUser = async () => {
      try {
        await userService.initialize();
        setUserInitialized(true);
      } catch (error) {
        console.error('Failed to initialize user:', error);
        // 即使初始化失败，也允许用户继续使用（使用简化的UID）
        setUserInitialized(true);
      }
    };

    initializeUser();
  }, []);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image/(jpeg|png)')) {
      toast.error('仅支持JPEG/PNG格式图片');
      return;
    }

    setIsLoading(true);
    
    try {
      // Compress if over 8MB
      let processedFile = file;
      if (file.size > 8 * 1024 * 1024) {
        processedFile = await compressImage(file, {
          maxSizeMB: 8,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        });
        toast.success('图片已自动压缩');
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(processedFile);
    } catch (error) {
      toast.error('图片处理失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    // 获取用户ID，优先使用userService，失败时使用备用方案
    let userId: string;
    const currentUser = userService.getCurrentUser();

    if (currentUser) {
      userId = currentUser.uid;
    } else {
      // 备用方案：使用简化的用户ID生成
      try {
        const storedUID = localStorage.getItem('foodsafety_user_uid');
        if (storedUID) {
          userId = storedUID;
        } else {
          // 生成简单的用户ID
          const fingerprint = [
            navigator.userAgent,
            navigator.language,
            screen.width + 'x' + screen.height,
            new Date().getTimezoneOffset(),
            navigator.platform
          ].join('|');

          let hash = 0;
          for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
          }

          userId = `fs_user_${Math.abs(hash).toString(36)}_${Date.now().toString(36).slice(-4)}`;
          localStorage.setItem('foodsafety_user_uid', userId);
        }
      } catch (error) {
        // 如果localStorage也不可用，使用临时ID
        userId = `temp_user_${Date.now()}`;
      }
    }

    setIsLoading(true);
    try {
      // 创建异步任务
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({
          image,
          userId: userId
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('任务已创建，正在处理中...');

        // 开始轮询任务状态
        pollTaskStatus(result.taskId);
      } else {
        toast.error(`上传失败: ${result.error || '未知错误'}`);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('上传失败');
      console.error(error);
      setIsLoading(false);
    }
  };

  // 轮询任务状态
  const pollTaskStatus = async (taskId: string) => {
    const maxAttempts = 60; // 最多轮询60次（2分钟）
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await fetch(`/api/task-status?taskId=${taskId}`);

        if (!response.ok) {
          throw new Error('获取任务状态失败');
        }

        const taskStatus = await response.json();

        if (taskStatus.status === 'completed') {
          // 任务完成
          setIsLoading(false);
          toast.success('处理完成！');

          if (taskStatus.result?.ingredients) {
            setIngredients(taskStatus.result.ingredients);
          }

          return;
        } else if (taskStatus.status === 'failed') {
          // 任务失败
          setIsLoading(false);
          toast.error(`处理失败: ${taskStatus.error || '未知错误'}`);
          return;
        } else if (taskStatus.status === 'processing') {
          // 任务处理中，显示进度
          const progress = taskStatus.progress || 0;
          console.log(`处理中... ${progress}%`);
        }

        // 继续轮询
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000); // 每2秒轮询一次
        } else {
          setIsLoading(false);
          toast.error('处理超时，请重试');
        }

      } catch (error) {
        console.error('轮询任务状态失败:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setIsLoading(false);
          toast.error('获取处理状态失败');
        }
      }
    };

    // 开始轮询
    setTimeout(poll, 1000); // 1秒后开始第一次轮询
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <UserInfo />
        <div className="flex items-center justify-center">
          <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl overflow-hidden p-8 border-4 border-accent">
            <h1 className="text-3xl font-bold text-primary mb-6 text-center">📸 食品图片上传</h1>

            <div className="space-y-6">
              <div
                className="border-4 border-dashed border-secondary rounded-2xl p-8 text-center hover:border-primary transition-all duration-200 ease-in-out transform hover:scale-105"
              >
                {image ? (
                  <div className="relative">
                    <img
                      src={image}
                      alt="预览"
                      className="img-preview mx-auto max-h-64 object-contain rounded-lg shadow-md cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                      }}
                    />
                    {isExpanded && (
                      <div
                        className="img-expanded"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(false);
                        }}
                      >
                        <img
                          src={image}
                          alt="放大预览"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="secondary"
                      className="w-full py-8"
                    >
                      <div className="space-y-2">
                        <span className="text-4xl block">🖼️</span>
                        <p className="text-lg font-semibold">选择文件</p>
                        <p className="text-sm text-gray-500">支持JPEG/PNG格式，最大8MB</p>
                      </div>
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/jpeg,image/png"
                      className="hidden"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={handleUpload}
                disabled={!image || isLoading}
                variant="primary"
                className="w-full"
              >
                {isLoading ? '🚀 处理中...' : '✨ 上传图片'}
              </Button>

              {ingredients && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">配料成分：</h3>
                  {ingredients ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {ingredients.map((item, index) => (
                        <li key={index}>
                          <p>{item.name}:{item.description}</p>
                          <p>是否健康:{item.is_healthy}</p>
                          <p>健康原因:{item.health_reason}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>未识别到有效配料</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
