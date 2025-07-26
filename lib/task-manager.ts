// 简单的任务管理器（内存存储）
export interface Task {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  processingStep: string
  fileInfo?: {
    name: string
    size: number
    type: string
  }
  result?: any
  error?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

class TaskManager {
  private tasks = new Map<string, Task>()

  createTask(taskId: string, fileInfo?: any): Task {
    const task: Task = {
      id: taskId,
      status: 'pending',
      progress: 0,
      processingStep: 'created',
      fileInfo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.tasks.set(taskId, task)
    console.log(`任务创建: ${taskId}`)
    return task
  }

  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.get(taskId)
    if (!task) {
      console.error(`任务不存在: ${taskId}`)
      return null
    }

    Object.assign(task, updates, {
      updatedAt: new Date().toISOString()
    })

    if (updates.status === 'completed') {
      task.completedAt = new Date().toISOString()
    }

    this.tasks.set(taskId, task)
    console.log(`任务更新: ${taskId}, 状态: ${task.status}, 进度: ${task.progress}%`)
    return task
  }

  getTask(taskId: string): Task | null {
    return this.tasks.get(taskId) || null
  }

  deleteTask(taskId: string): boolean {
    const deleted = this.tasks.delete(taskId)
    if (deleted) {
      console.log(`任务删除: ${taskId}`)
    }
    return deleted
  }

  getAllTasks(): Task[] {
    return Array.from(this.tasks.values())
  }

  // 清理超过1小时的任务
  cleanupOldTasks(): number {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    let cleaned = 0
    
    for (const [taskId, task] of this.tasks.entries()) {
      if (new Date(task.createdAt) < oneHourAgo) {
        this.tasks.delete(taskId)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`清理了 ${cleaned} 个过期任务`)
    }
    
    return cleaned
  }
}

// 导出单例实例
export const taskManager = new TaskManager()

// 定期清理过期任务
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    taskManager.cleanupOldTasks()
  }, 30 * 60 * 1000) // 每30分钟清理一次
}
