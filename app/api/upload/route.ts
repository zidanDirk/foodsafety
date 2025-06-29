import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { POST as ocrPost } from '@/app/api/ocr/route';

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


    // 调用OCR接口识别图片
    const ocrRequest = new Request(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/api/ocr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ image: base64Data })
    });
    
    const ocrResponse = await ocrPost(ocrRequest);
    const ocrData = await ocrResponse.json();

    return NextResponse.json({
      success: true,
      base64: base64Data,
      tempPath: `/temp/${fileName}`,
      ocrResult: ocrData
    });

  } catch (error) {
    console.error('上传错误:', error);
    return NextResponse.json(
      { error: '服务器处理图片时出错' },
      { status: 500 }
    );
  }
}
