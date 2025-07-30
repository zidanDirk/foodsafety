// 内存存储降级方案
import { Task } from './database'

class MemoryStorage {
  private tasks = new Map<string, Task>()

  createTask(taskId: string, fileInfo: any): Task {
    const task: Task = {
      id: taskId,
      status: 'pending',
      progress: 0,
      processing_step: 'created',
      file_info: fileInfo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    this.tasks.set(taskId, task)
    console.log(`内存存储 - 任务创建: ${taskId}`)
    return task
  }

  updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.get(taskId)
    if (!task) {
      console.error(`内存存储 - 任务不存在: ${taskId}`)
      return null
    }

    Object.assign(task, updates, {
      updated_at: new Date().toISOString()
    })

    if (updates.status === 'completed') {
      task.completed_at = new Date().toISOString()
    }

    this.tasks.set(taskId, task)
    console.log(`内存存储 - 任务更新: ${taskId}, 状态: ${task.status}, 进度: ${task.progress}%`)
    return task
  }

  getTask(taskId: string): Task | null {
    return this.tasks.get(taskId) || null
  }

  deleteTask(taskId: string): boolean {
    const deleted = this.tasks.delete(taskId)
    if (deleted) {
      console.log(`内存存储 - 任务删除: ${taskId}`)
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
      if (new Date(task.created_at) < oneHourAgo) {
        this.tasks.delete(taskId)
        cleaned++
      }
    }
    
    if (cleaned > 0) {
      console.log(`内存存储 - 清理了 ${cleaned} 个过期任务`)
    }
    
    return cleaned
  }

  getTaskStats() {
    const tasks = this.getAllTasks()
    const stats: Record<string, number> = {}
    
    tasks.forEach(task => {
      stats[task.status] = (stats[task.status] || 0) + 1
    })
    
    return stats
  }
  
  // 清空所有任务
  clear() {
    this.tasks.clear()
  }
}

// 导出单例实例
export const memoryStorage = new MemoryStorage()

// 定期清理过期任务
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    memoryStorage.cleanupOldTasks()
  }, 30 * 60 * 1000) // 每30分钟清理一次
}
