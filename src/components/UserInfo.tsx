// 用户信息显示组件
'use client';

import React, { useState, useEffect } from 'react';

export default function UserInfo() {
  const [uid, setUid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // 简化版本：直接生成一个基于浏览器特征的UID
    const generateSimpleUID = () => {
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        navigator.platform
      ].join('|');

      // 简单哈希
      let hash = 0;
      for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }

      return `fs_user_${Math.abs(hash).toString(36)}_${Date.now().toString(36).slice(-4)}`;
    };

    // 尝试从localStorage获取现有UID
    let storedUID = null;
    try {
      storedUID = localStorage.getItem('foodsafety_user_uid');
    } catch (e) {
      console.warn('Cannot access localStorage');
    }

    if (storedUID) {
      setUid(storedUID);
    } else {
      const newUID = generateSimpleUID();
      setUid(newUID);
      try {
        localStorage.setItem('foodsafety_user_uid', newUID);
      } catch (e) {
        console.warn('Cannot save to localStorage');
      }
    }

    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span className="text-sm text-gray-600">正在识别用户...</span>
        </div>
      </div>
    );
  }

  if (!uid) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">👤</span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              用户 ID: {uid.substring(0, 16)}...
            </div>
            <div className="text-xs text-gray-500">
              自动识别用户
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-primary hover:text-primary-dark text-sm font-medium transition-colors"
        >
          {showDetails ? '隐藏详情' : '查看详情'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
              <div className="space-y-1 text-gray-600">
                <div>完整 UID: <span className="font-mono text-xs">{uid}</span></div>
                <div>创建时间: {new Date().toLocaleDateString()}</div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">设备信息</h4>
              <div className="space-y-1 text-gray-600">
                <div>平台: {navigator.platform}</div>
                <div>语言: {navigator.language}</div>
                <div>屏幕: {screen.width}x{screen.height}</div>
                <div>在线状态: {navigator.onLine ? '在线' : '离线'}</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                用户识别基于浏览器指纹和设备特征，无需注册登录
              </span>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('foodsafety_user_uid');
                    window.location.reload();
                  } catch (e) {
                    console.warn('Cannot clear localStorage');
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 transition-colors"
              >
                重置用户数据
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
