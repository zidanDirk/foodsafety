import { pgTable, text, timestamp, uuid, jsonb, integer, boolean } from 'drizzle-orm/pg-core';

// 用户表
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  uid: text('uid').notNull().unique(), // 浏览器指纹生成的UID
  fingerprint: jsonb('fingerprint'), // 浏览器指纹数据
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastActiveAt: timestamp('last_active_at').defaultNow().notNull(),
});

// 食品检测记录表
export const foodDetections = pgTable('food_detections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  imageUrl: text('image_url'), // 上传的图片URL
  ocrResult: jsonb('ocr_result'), // OCR识别结果
  ingredients: jsonb('ingredients'), // 识别出的成分列表
  safetyAnalysis: jsonb('safety_analysis'), // 安全性分析结果
  riskLevel: text('risk_level'), // 风险等级: low, medium, high
  isProcessed: boolean('is_processed').default(false), // 是否已处理完成
  processingError: text('processing_error'), // 处理错误信息
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 成分数据库表
export const ingredientsDatabase = pgTable('ingredients_database', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // 成分名称
  aliases: jsonb('aliases'), // 别名列表
  category: text('category'), // 分类
  riskLevel: text('risk_level'), // 风险等级
  description: text('description'), // 描述
  warnings: jsonb('warnings'), // 警告信息
  regulations: jsonb('regulations'), // 法规信息
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 用户反馈表
export const userFeedback = pgTable('user_feedback', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  detectionId: uuid('detection_id').references(() => foodDetections.id),
  feedbackType: text('feedback_type').notNull(), // 反馈类型: accuracy, suggestion, bug
  rating: integer('rating'), // 评分 1-5
  comment: text('comment'), // 评论内容
  isResolved: boolean('is_resolved').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 异步任务状态表
export const asyncTasks = pgTable('async_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskType: text('task_type').notNull(), // 任务类型: 'food_detection'
  status: text('status').notNull().default('pending'), // pending, processing, completed, failed
  userId: uuid('user_id').references(() => users.id).notNull(),
  detectionId: uuid('detection_id').references(() => foodDetections.id), // 关联的检测记录ID
  inputData: jsonb('input_data'), // 输入数据(如base64图片)
  result: jsonb('result'), // 处理结果
  error: text('error'), // 错误信息
  progress: integer('progress').default(0), // 进度百分比 0-100
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 系统统计表
export const systemStats = pgTable('system_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  date: timestamp('date').notNull(),
  totalDetections: integer('total_detections').default(0),
  totalUsers: integer('total_users').default(0),
  avgProcessingTime: integer('avg_processing_time'), // 平均处理时间(毫秒)
  errorRate: integer('error_rate'), // 错误率(百分比)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 导出所有表的类型
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type FoodDetection = typeof foodDetections.$inferSelect;
export type NewFoodDetection = typeof foodDetections.$inferInsert;

export type Ingredient = typeof ingredientsDatabase.$inferSelect;
export type NewIngredient = typeof ingredientsDatabase.$inferInsert;

export type Feedback = typeof userFeedback.$inferSelect;
export type NewFeedback = typeof userFeedback.$inferInsert;

export type AsyncTask = typeof asyncTasks.$inferSelect;
export type NewAsyncTask = typeof asyncTasks.$inferInsert;

export type SystemStat = typeof systemStats.$inferSelect;
export type NewSystemStat = typeof systemStats.$inferInsert;
