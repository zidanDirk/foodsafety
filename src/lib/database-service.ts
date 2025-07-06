import { eq, desc, and } from 'drizzle-orm';
import { db } from './db';
import { users, foodDetections, userFeedback, asyncTasks, type User, type NewUser, type FoodDetection, type NewFoodDetection, type AsyncTask, type NewAsyncTask } from './schema';

export class DatabaseService {
  // 用户相关操作
  static async createUser(userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt' | 'lastActiveAt'>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  static async getUserByUid(uid: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return user || null;
  }

  static async updateUserActivity(uid: string): Promise<void> {
    await db.update(users)
      .set({ 
        lastActiveAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.uid, uid));
  }

  static async updateUserFingerprint(uid: string, fingerprint: any): Promise<void> {
    await db.update(users)
      .set({ 
        fingerprint,
        updatedAt: new Date()
      })
      .where(eq(users.uid, uid));
  }

  // 食品检测相关操作
  static async createDetection(detectionData: Omit<NewFoodDetection, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoodDetection> {
    const [detection] = await db.insert(foodDetections).values(detectionData).returning();
    return detection;
  }

  static async getDetectionById(id: string): Promise<FoodDetection | null> {
    const [detection] = await db.select().from(foodDetections).where(eq(foodDetections.id, id)).limit(1);
    return detection || null;
  }

  static async getUserDetections(userId: string, limit: number = 10): Promise<FoodDetection[]> {
    return await db.select()
      .from(foodDetections)
      .where(eq(foodDetections.userId, userId))
      .orderBy(desc(foodDetections.createdAt))
      .limit(limit);
  }

  static async updateDetectionResult(
    id: string, 
    updateData: {
      ocrResult?: any;
      ingredients?: any;
      safetyAnalysis?: any;
      riskLevel?: string;
      isProcessed?: boolean;
      processingError?: string;
    }
  ): Promise<void> {
    await db.update(foodDetections)
      .set({ 
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(foodDetections.id, id));
  }

  // 统计相关操作
  static async getUserStats(userId: string): Promise<{
    totalDetections: number;
    recentDetections: FoodDetection[];
    riskDistribution: Record<string, number>;
  }> {
    // 获取用户总检测数
    const detections = await db.select()
      .from(foodDetections)
      .where(eq(foodDetections.userId, userId));

    // 获取最近的检测记录
    const recentDetections = await this.getUserDetections(userId, 5);

    // 计算风险分布
    const riskDistribution = detections.reduce((acc, detection) => {
      const risk = detection.riskLevel || 'unknown';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalDetections: detections.length,
      recentDetections,
      riskDistribution
    };
  }

  // 系统统计
  static async getSystemStats(): Promise<{
    totalUsers: number;
    totalDetections: number;
    todayDetections: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 获取总用户数
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;

    // 获取总检测数
    const allDetections = await db.select().from(foodDetections);
    const totalDetections = allDetections.length;

    // 获取今日检测数
    const todayDetections = allDetections.filter(detection => {
      const detectionDate = new Date(detection.createdAt);
      return detectionDate >= today;
    });

    return {
      totalUsers,
      totalDetections,
      todayDetections: todayDetections.length
    };
  }

  // 异步任务相关操作
  static async createAsyncTask(taskData: Omit<NewAsyncTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<AsyncTask> {
    const [task] = await db.insert(asyncTasks).values(taskData).returning();
    return task;
  }

  static async getAsyncTaskById(id: string): Promise<AsyncTask | null> {
    const [task] = await db.select().from(asyncTasks).where(eq(asyncTasks.id, id)).limit(1);
    return task || null;
  }

  static async updateAsyncTask(
    id: string,
    updateData: {
      status?: string;
      progress?: number;
      result?: any;
      error?: string;
      startedAt?: Date;
      completedAt?: Date;
    }
  ): Promise<void> {
    await db.update(asyncTasks)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(asyncTasks.id, id));
  }

  static async getUserAsyncTasks(userId: string, limit: number = 10): Promise<AsyncTask[]> {
    return await db.select()
      .from(asyncTasks)
      .where(eq(asyncTasks.userId, userId))
      .orderBy(desc(asyncTasks.createdAt))
      .limit(limit);
  }

  static async getPendingAsyncTasks(limit: number = 10): Promise<AsyncTask[]> {
    return await db.select()
      .from(asyncTasks)
      .where(eq(asyncTasks.status, 'pending'))
      .orderBy(asyncTasks.createdAt)
      .limit(limit);
  }

  // 清理旧数据
  static async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    // 删除旧的检测记录
    await db.delete(foodDetections)
      .where(and(
        eq(foodDetections.createdAt, cutoffDate)
      ));
  }
}
