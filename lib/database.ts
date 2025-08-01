// 数据库连接和模式定义
import { sql, createPool } from '@vercel/postgres'
import { Pool } from '@vercel/postgres'

// 创建连接池
let pool: Pool | null = null

function getPool() {
  if (!pool) {
    pool = createPool({
      connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
      // 连接池配置
      max: 20, // 最大连接数
      idleTimeout: 30000, // 空闲连接超时时间(毫秒)
      connectionTimeout: 5000, // 连接超时时间(毫秒)
    })
  }
  return pool
}

// 确保数据库连接配置
// @vercel/postgres 需要 POSTGRES_URL 环境变量
if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
  console.warn('数据库连接字符串未设置，某些功能可能无法正常工作')
}

// 如果只有 DATABASE_URL，设置 POSTGRES_URL
if (process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL
  console.log('已将 DATABASE_URL 设置为 POSTGRES_URL')
}

export interface Task {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  processing_step: string
  file_info?: {
    name: string
    size: number
    type: string
  }
  ocr_result?: any
  ai_result?: any
  error_message?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export class DatabaseManager {
  // 检查数据库连接
  static async checkConnection() {
    try {
      const databaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error('数据库连接字符串未配置')
      }

      // 使用连接池进行连接测试
      const pool = getPool()
      const client = await pool.connect()
      try {
        await client.query('SELECT 1 as test')
        return true
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('数据库连接检查失败:', error)
      return false
    }
  }

  // 初始化数据库表
  static async initializeTables() {
    try {
      // 首先检查连接
      const isConnected = await this.checkConnection()
      if (!isConnected) {
        throw new Error('数据库连接失败')
      }

      const pool = getPool()
      const client = await pool.connect()
      
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS tasks (
            id VARCHAR(255) PRIMARY KEY,
            status VARCHAR(50) NOT NULL DEFAULT 'pending',
            progress INTEGER NOT NULL DEFAULT 0,
            processing_step VARCHAR(255) NOT NULL DEFAULT 'created',
            file_info JSONB,
            ocr_result JSONB,
            ai_result JSONB,
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            completed_at TIMESTAMP WITH TIME ZONE
          )
        `)

        // 创建索引
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)
        `)

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at)
        `)

        console.log('数据库表初始化成功')
        return true
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('数据库表初始化失败:', error)
      return false
    }
  }

  // 创建任务
  static async createTask(taskId: string, fileInfo: any): Promise<Task | null> {
    try {
      const pool = getPool()
      const client = await pool.connect()
      
      try {
        const result = await client.query(
          `INSERT INTO tasks (id, file_info, created_at, updated_at)
           VALUES ($1, $2, NOW(), NOW())
           RETURNING *`,
          [taskId, JSON.stringify(fileInfo)]
        )
        
        if (result.rows.length > 0) {
          return this.formatTask(result.rows[0])
        }
        
        return null
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('创建任务失败:', error)
      return null
    }
  }

  // 更新任务
  static async updateTask(taskId: string, updates: Partial<Task>): Promise<Task | null> {
    try {
      const pool = getPool()
      const client = await pool.connect()
      
      try {
        const setClause = []
        const values = []
        let paramIndex = 1

        if (updates.status !== undefined) {
          setClause.push(`status = $${paramIndex++}`)
          values.push(updates.status)
        }
        
        if (updates.progress !== undefined) {
          setClause.push(`progress = $${paramIndex++}`)
          values.push(updates.progress)
        }
        
        if (updates.processing_step !== undefined) {
          setClause.push(`processing_step = $${paramIndex++}`)
          values.push(updates.processing_step)
        }
        
        if (updates.ocr_result !== undefined) {
          setClause.push(`ocr_result = $${paramIndex++}`)
          values.push(JSON.stringify(updates.ocr_result))
        }
        
        if (updates.ai_result !== undefined) {
          setClause.push(`ai_result = $${paramIndex++}`)
          values.push(JSON.stringify(updates.ai_result))
        }
        
        if (updates.error_message !== undefined) {
          setClause.push(`error_message = $${paramIndex++}`)
          values.push(updates.error_message)
        }
        
        if (updates.status === 'completed') {
          setClause.push(`completed_at = NOW()`)
        }
        
        setClause.push(`updated_at = NOW()`)
        
        const query = `
          UPDATE tasks 
          SET ${setClause.join(', ')}
          WHERE id = $${paramIndex}
          RETURNING *
        `
        
        values.push(taskId)
        
        const result = await client.query(query, values)
        
        if (result.rows.length > 0) {
          return this.formatTask(result.rows[0])
        }
        
        return null
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('更新任务失败:', error)
      return null
    }
  }

  // 获取任务
  static async getTask(taskId: string): Promise<Task | null> {
    try {
      const pool = getPool()
      const client = await pool.connect()
      
      try {
        const result = await client.query(
          'SELECT * FROM tasks WHERE id = $1',
          [taskId]
        )
        
        if (result.rows.length > 0) {
          return this.formatTask(result.rows[0])
        }
        
        return null
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('获取任务失败:', error)
      return null
    }
  }

  // 删除任务
  static async deleteTask(taskId: string): Promise<boolean> {
    try {
      const pool = getPool()
      const client = await pool.connect()
      
      try {
        await client.query(
          'DELETE FROM tasks WHERE id = $1',
          [taskId]
        )
        return true
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('删除任务失败:', error)
      return false
    }
  }

  // 清理过期任务（超过24小时）
  static async cleanupOldTasks(): Promise<number> {
    try {
      const pool = getPool()
      const client = await pool.connect()
      
      try {
        const result = await client.query(`
          DELETE FROM tasks 
          WHERE created_at < NOW() - INTERVAL '24 hours'
          RETURNING id
        `)
        
        console.log(`清理了 ${result.rows.length} 个过期任务`)
        return result.rows.length
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('清理过期任务失败:', error)
      return 0
    }
  }

  // 获取任务统计
  static async getTaskStats() {
    try {
      const pool = getPool()
      const client = await pool.connect()
      
      try {
        const result = await client.query(`
          SELECT 
            status,
            COUNT(*) as count
          FROM tasks 
          WHERE created_at > NOW() - INTERVAL '24 hours'
          GROUP BY status
        `)
        
        return result.rows.reduce((acc, row) => {
          acc[row.status] = parseInt(row.count)
          return acc
        }, {})
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('获取任务统计失败:', error)
      return {}
    }
  }

  // 格式化任务数据
  private static formatTask(row: any): Task {
    return {
      id: row.id,
      status: row.status,
      progress: row.progress,
      processing_step: row.processing_step,
      file_info: row.file_info,
      ocr_result: row.ocr_result,
      ai_result: row.ai_result,
      error_message: row.error_message,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at
    }
  }
}

// 初始化数据库（在应用启动时调用）
export async function initializeDatabase() {
  return await DatabaseManager.initializeTables()
}
