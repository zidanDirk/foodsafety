'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function TestAsyncPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [taskId, setTaskId] = useState<string>('');
  const [taskStatus, setTaskStatus] = useState<any>(null);

  // 测试用的小图片（1x1像素的JPEG）
  const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

  const testAsyncUpload = async () => {
    setIsLoading(true);
    try {
      // 创建异步任务
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: testImage,
          userId: 'test-user-123'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setTaskId(result.taskId);
        toast.success('任务已创建！');
        
        // 开始轮询任务状态
        pollTaskStatus(result.taskId);
      } else {
        toast.error(`创建任务失败: ${result.error}`);
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('请求失败');
      console.error(error);
      setIsLoading(false);
    }
  };

  const pollTaskStatus = async (taskId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const response = await fetch(`/api/task-status?taskId=${taskId}`);
        const status = await response.json();
        
        setTaskStatus(status);

        if (status.status === 'completed') {
          setIsLoading(false);
          toast.success('任务完成！');
          return;
        } else if (status.status === 'failed') {
          setIsLoading(false);
          toast.error(`任务失败: ${status.error}`);
          return;
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setIsLoading(false);
          toast.error('轮询超时');
        }
      } catch (error) {
        console.error('轮询失败:', error);
        if (attempts < maxAttempts) {
          setTimeout(poll, 2000);
        } else {
          setIsLoading(false);
          toast.error('轮询失败');
        }
      }
    };

    setTimeout(poll, 1000);
  };

  const checkTaskStatus = async () => {
    if (!taskId) {
      toast.error('请先创建任务');
      return;
    }

    try {
      const response = await fetch(`/api/task-status?taskId=${taskId}`);
      const status = await response.json();
      setTaskStatus(status);
      toast.success('状态已更新');
    } catch (error) {
      toast.error('获取状态失败');
      console.error(error);
    }
  };

  const processTaskQueue = async () => {
    try {
      const response = await fetch('/api/process-tasks', {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        toast.success('任务队列处理完成');
      } else {
        toast.error('处理失败');
      }
    } catch (error) {
      toast.error('请求失败');
      console.error(error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">异步任务系统测试</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">测试操作</h2>
          <div className="space-x-4">
            <button
              onClick={testAsyncUpload}
              disabled={isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isLoading ? '处理中...' : '测试异步上传'}
            </button>
            
            <button
              onClick={checkTaskStatus}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              检查任务状态
            </button>
            
            <button
              onClick={processTaskQueue}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              手动处理任务队列
            </button>
          </div>
        </div>

        {taskId && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">当前任务</h2>
            <p className="text-gray-600">任务ID: {taskId}</p>
          </div>
        )}

        {taskStatus && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">任务状态</h2>
            <div className="space-y-2">
              <p><strong>状态:</strong> {taskStatus.status}</p>
              <p><strong>进度:</strong> {taskStatus.progress}%</p>
              {taskStatus.error && (
                <p className="text-red-600"><strong>错误:</strong> {taskStatus.error}</p>
              )}
              {taskStatus.result && (
                <div>
                  <p><strong>结果:</strong></p>
                  <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                    {JSON.stringify(taskStatus.result, null, 2)}
                  </pre>
                </div>
              )}
              <p><strong>创建时间:</strong> {new Date(taskStatus.createdAt).toLocaleString()}</p>
              {taskStatus.startedAt && (
                <p><strong>开始时间:</strong> {new Date(taskStatus.startedAt).toLocaleString()}</p>
              )}
              {taskStatus.completedAt && (
                <p><strong>完成时间:</strong> {new Date(taskStatus.completedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
