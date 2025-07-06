import { DatabaseService } from './database-service';
import { OCRService } from './ocr-service';
import { LLMService } from './llm-service';
import { type AsyncTask, type NewAsyncTask } from './schema';

export interface TaskResult {
  ocrResult?: string;
  ingredients?: any[];
  error?: string;
}

export class AsyncTaskService {
  private static instance: AsyncTaskService;

  private constructor() {}

  public static getInstance(): AsyncTaskService {
    if (!AsyncTaskService.instance) {
      AsyncTaskService.instance = new AsyncTaskService();
    }
    return AsyncTaskService.instance;
  }

  /**
   * 创建新的异步任务
   */
  async createTask(
    userId: string,
    taskType: string,
    inputData: any,
    detectionId?: string
  ): Promise<AsyncTask> {
    const taskData: Omit<NewAsyncTask, 'id' | 'createdAt' | 'updatedAt'> = {
      taskType,
      status: 'pending',
      userId,
      detectionId,
      inputData,
      progress: 0
    };

    return await DatabaseService.createAsyncTask(taskData);
  }

  /**
   * 获取任务状态
   */
  async getTaskStatus(taskId: string): Promise<AsyncTask | null> {
    return await DatabaseService.getAsyncTaskById(taskId);
  }

  /**
   * 处理食品检测任务
   */
  async processFoodDetectionTask(taskId: string): Promise<void> {
    try {
      // 更新任务状态为处理中
      await DatabaseService.updateAsyncTask(taskId, {
        status: 'processing',
        startedAt: new Date(),
        progress: 10
      });

      // 获取任务详情
      const task = await DatabaseService.getAsyncTaskById(taskId);
      if (!task || !task.inputData?.base64Data) {
        throw new Error('Invalid task or missing input data');
      }

      const { base64Data } = task.inputData;

      // 步骤1: OCR识别
      console.log(`Task ${taskId}: Starting OCR recognition...`);
      await DatabaseService.updateAsyncTask(taskId, { progress: 30 });
      
      const ocrService = OCRService.getInstance();
      const ocrText = await ocrService.recognize(base64Data);
      
      if (!ocrText) {
        throw new Error('OCR recognition failed - no text detected');
      }

      console.log(`Task ${taskId}: OCR completed, text length: ${ocrText.length}`);
      await DatabaseService.updateAsyncTask(taskId, { progress: 60 });

      // 步骤2: LLM分析
      console.log(`Task ${taskId}: Starting LLM analysis...`);
      const llmService = LLMService.getInstance();
      const ingredients = await llmService.analyzeIngredients(ocrText);

      console.log(`Task ${taskId}: LLM analysis completed, found ${ingredients.length} ingredients`);
      await DatabaseService.updateAsyncTask(taskId, { progress: 90 });

      // 保存结果
      const result: TaskResult = {
        ocrResult: ocrText,
        ingredients
      };

      // 更新任务为完成状态
      await DatabaseService.updateAsyncTask(taskId, {
        status: 'completed',
        progress: 100,
        result,
        completedAt: new Date()
      });

      // 如果有关联的检测记录，也更新它
      if (task.detectionId) {
        await DatabaseService.updateDetectionResult(task.detectionId, {
          ocrResult: { words_result: ocrText.split('\n').map(text => ({ words: text })) },
          ingredients,
          isProcessed: true
        });
      }

      console.log(`Task ${taskId}: Processing completed successfully`);

    } catch (error) {
      console.error(`Task ${taskId}: Processing failed:`, error);
      
      // 更新任务为失败状态
      await DatabaseService.updateAsyncTask(taskId, {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        completedAt: new Date()
      });

      // 如果有关联的检测记录，也更新错误信息
      const task = await DatabaseService.getAsyncTaskById(taskId);
      if (task?.detectionId) {
        await DatabaseService.updateDetectionResult(task.detectionId, {
          processingError: error instanceof Error ? error.message : 'Unknown error',
          isProcessed: true
        });
      }
    }
  }

  /**
   * 处理待处理的任务队列
   */
  async processTaskQueue(): Promise<void> {
    try {
      const pendingTasks = await DatabaseService.getPendingAsyncTasks(5);
      
      if (pendingTasks.length === 0) {
        return;
      }

      console.log(`Processing ${pendingTasks.length} pending tasks...`);

      // 并行处理多个任务（但限制并发数）
      const processingPromises = pendingTasks.map(task => {
        if (task.taskType === 'food_detection') {
          return this.processFoodDetectionTask(task.id);
        }
        return Promise.resolve();
      });

      await Promise.allSettled(processingPromises);
      
    } catch (error) {
      console.error('Error processing task queue:', error);
    }
  }

  /**
   * 启动任务处理器（定期检查待处理任务）
   */
  startTaskProcessor(intervalMs: number = 5000): void {
    setInterval(() => {
      this.processTaskQueue().catch(error => {
        console.error('Task processor error:', error);
      });
    }, intervalMs);

    console.log(`Task processor started with ${intervalMs}ms interval`);
  }

  /**
   * 获取用户的任务列表
   */
  async getUserTasks(userId: string, limit: number = 10): Promise<AsyncTask[]> {
    return await DatabaseService.getUserAsyncTasks(userId, limit);
  }
}
