import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// 获取数据库URL，Next.js会自动加载.env文件
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined. Please check your .env file.');
}

// 创建Neon连接
const sql = neon(databaseUrl);

// 创建Drizzle数据库实例
export const db = drizzle(sql);

// 导出SQL连接以供直接查询使用
export { sql };
