'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { compressImage } from '@/src/lib/image-utils';
import { toast } from 'react-hot-toast';
import Button from '../../src/components/Button'; // 导入Button组件
import { ingredientItem } from '@/src/types/ingredients';

type IngredientResult = ingredientItem[];

export default function UploadPage() {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ingredients, setIngredients] = useState<IngredientResult | null>(null);
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
      if (result.success) {
        toast.success('识别成功');
        setIngredients(result.ingredients);
      } else {
        toast.error(`识别失败: ${result.error || '未知错误'}`);
      }
    } catch (error) {
      toast.error('上传失败');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-16rem)] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
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
  );
}
