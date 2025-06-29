import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { OCRService } from '@/lib/ocr-service';
import { LLMService } from '@/lib/llm-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    
    if (!image) {
      return NextResponse.json(
        { error: '未提供图片数据' },
        { status: 400 }
      );
    }

    // 验证Base64数据
    const base64Data = image.split(';base64,').pop();
    if (!base64Data) {
      return NextResponse.json(
        { error: '无效的图片格式' },
        { status: 400 }
      );
    }

    // 创建临时目录
    const tempDir = path.join(process.cwd(), 'public', 'temp');
    await fs.mkdir(tempDir, { recursive: true });

    // 生成唯一文件名
    const fileName = `${uuidv4()}.jpg`;
    const filePath = path.join(tempDir, fileName);

    // 保存文件
    await fs.writeFile(filePath, base64Data, 'base64');

    // 直接调用OCR服务识别图片
    const ocrText = await OCRService.getInstance().recognize(base64Data);
    const ocrData = {
      words_result: ocrText.split('\n').map(text => ({ words: text }))
    };
    
    // 调用LLM服务分析配料
    try {
      const ocrRes = ocrData.words_result?.map(item => item.words).join('\n') || ''
      if(!ocrRes) return NextResponse.json(
        { error: '无法识别图片中的文字' },
        { status: 500 }
      )
      const llmService = LLMService.getInstance();
      const ingredients = await llmService.analyzeIngredients(
        ocrRes
      );

      console.log(111, ingredients)

      return NextResponse.json({
        success: true,
        base64: base64Data,
        tempPath: `/temp/${fileName}`,
        ingredients
      });
    } catch (error) {
      console.error('LLM分析错误:', error);
      return NextResponse.json(
        { error: '配料分析失败' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json(
      { error: '服务器处理图片时出错' },
      { status: 500 }
    );
  }
}
