import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AsyncTaskService } from '@/lib/async-task-service';
import { DatabaseService } from '@/lib/database-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { image, userId } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: '未提供图片数据' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: '未提供用户ID' },
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

    // 生成文件名
    const fileName = `${uuidv4()}.jpg`;

    // 在Netlify环境中，我们不需要保存临时文件
    if (!process.env.NETLIFY) {
      // 本地开发环境：保存临时文件
      const tempDir = path.join(process.cwd(), 'public', 'temp');

      // 确保temp目录存在
      try {
        await fs.access(tempDir);
      } catch {
        await fs.mkdir(tempDir, { recursive: true });
      }

      const filePath = path.join(tempDir, fileName);

      // 将base64转换为buffer并保存
      const buffer = Buffer.from(base64Data, 'base64');
      await fs.writeFile(filePath, buffer);

      console.log('文件已保存到:', filePath);
    }

    // 获取用户信息
    const user = await DatabaseService.getUserByUid(userId);
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 创建检测记录
    const detection = await DatabaseService.createDetection({
      userId: user.id,
      imageUrl: process.env.NETLIFY ? fileName : `/temp/${fileName}`,
      isProcessed: false
    });

    // 创建异步任务
    const taskService = AsyncTaskService.getInstance();
    const task = await taskService.createTask(
      user.id,
      'food_detection',
      { base64Data, fileName },
      detection.id
    );

    console.log(`Created async task ${task.id} for user ${userId}`);

    // 立即返回任务ID，不等待处理完成
    return NextResponse.json({
      success: true,
      taskId: task.id,
      detectionId: detection.id,
      message: '任务已创建，正在后台处理...'
    });

  } catch (error) {
    console.error('上传处理错误:', error);
    return NextResponse.json(
      { error: '文件处理失败' },
      { status: 500 }
    );
  }
}
