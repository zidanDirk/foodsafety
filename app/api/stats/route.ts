import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../src/lib/database-service';

// GET - 获取系统统计信息
export async function GET(request: NextRequest) {
  try {
    const stats = await DatabaseService.getSystemStats();
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system stats' },
      { status: 500 }
    );
  }
}
