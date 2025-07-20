const { SimpleTaskProcessor } = require('../../lib/simple-task-processor.js')

export default function handler(req, res) {
  if (req.method === 'GET') {
    // 获取所有任务
    const allTasks = Array.from(SimpleTaskProcessor.tasks.entries()).map(([id, task]) => ({
      id,
      ...task
    }))
    
    return res.status(200).json({
      totalTasks: SimpleTaskProcessor.tasks.size,
      tasks: allTasks
    })
  }
  
  if (req.method === 'POST') {
    // 创建测试任务
    const testTaskId = `test_${Date.now()}`
    const task = SimpleTaskProcessor.createTask(testTaskId, {
      name: 'test.jpg',
      size: 1024,
      type: 'image/jpeg'
    })
    
    return res.status(200).json({
      message: 'Test task created',
      task
    })
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
}
