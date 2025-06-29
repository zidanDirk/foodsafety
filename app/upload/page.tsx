'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { compressImage } from '@/src/lib/image-utils';
import { toast } from 'react-hot-toast';

export default function UploadPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsLoading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({ image }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();
      toast.success('上传成功');
      console.log('Base64结果:', result.base64);
    } catch (error) {
      toast.error('上传失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">食品安全图片上传</h1>
        
        <div className="space-y-6">
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png"
              className="hidden"
            />
            {image ? (
              <img 
                src={image} 
                alt="预览" 
                className="mx-auto max-h-64 object-contain"
              />
            ) : (
              <div className="space-y-2">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">点击上传</span> 或拖放图片
                </p>
                <p className="text-xs text-gray-500">支持JPEG/PNG格式，最大8MB</p>
              </div>
            )}
          </div>

          <button
            onClick={handleUpload}
            disabled={!image || isLoading}
            className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${(!image || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? '处理中...' : '上传图片'}
          </button>
        </div>
      </div>
    </div>
  );
}
