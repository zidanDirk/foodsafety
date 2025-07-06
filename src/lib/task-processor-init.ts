import { AsyncTaskService } from './async-task-service';

// 初始化任务处理器
let isInitialized = false;

export function initializeTaskProcessor() {
  if (isInitialized) {
    return;
  }

  try {
    const taskService = AsyncTaskService.getInstance();
    
    // 启动任务处理器，每5秒检查一次待处理任务
    taskService.startTaskProcessor(5000);
    
    isInitialized = true;
    console.log('Task processor initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize task processor:', error);
  }
}

// 在服务器环境中自动初始化
if (typeof window === 'undefined') {
  // 延迟初始化，确保数据库连接已建立
  setTimeout(() => {
    initializeTaskProcessor();
  }, 2000);
}
