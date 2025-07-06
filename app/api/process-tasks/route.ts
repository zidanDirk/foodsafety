import { NextRequest, NextResponse } from 'next/server';
import { AsyncTaskService } from '../../../src/lib/async-task-service';

export const dynamic = 'force-dynamic';

// POST - 手动触发任务处理（用于测试或手动处理）
export async function POST(request: NextRequest) {
  try {
    const taskService = AsyncTaskService.getInstance();
    
    // 处理待处理的任务队列
    await taskService.processTaskQueue();
    
    return NextResponse.json({
      success: true,
      message: 'Task processing completed'
    });

  } catch (error) {
    console.error('Error processing tasks:', error);
    return NextResponse.json(
      { error: 'Failed to process tasks' },
      { status: 500 }
    );
  }
}

// GET - 获取任务处理状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const taskService = AsyncTaskService.getInstance();
    const tasks = await taskService.getUserTasks(userId, 20);

    return NextResponse.json({
      tasks: tasks.map(task => ({
        id: task.id,
        taskType: task.taskType,
        status: task.status,
        progress: task.progress,
        createdAt: task.createdAt,
        startedAt: task.startedAt,
        completedAt: task.completedAt,
        error: task.error
      }))
    });

  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user tasks' },
      { status: 500 }
    );
  }
}
