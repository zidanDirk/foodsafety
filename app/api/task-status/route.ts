import { NextRequest, NextResponse } from 'next/server';
import { AsyncTaskService } from '../../../src/lib/async-task-service';

export const dynamic = 'force-dynamic';

// GET - 获取任务状态
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const taskService = AsyncTaskService.getInstance();
    const task = await taskService.getTaskStatus(taskId);

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    // 返回任务状态信息
    return NextResponse.json({
      taskId: task.id,
      status: task.status,
      progress: task.progress,
      result: task.result,
      error: task.error,
      createdAt: task.createdAt,
      startedAt: task.startedAt,
      completedAt: task.completedAt
    });

  } catch (error) {
    console.error('Error fetching task status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task status' },
      { status: 500 }
    );
  }
}
