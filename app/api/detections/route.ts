import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../src/lib/database-service';

// GET - 获取用户的检测记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const detections = await DatabaseService.getUserDetections(userId, limit);
    return NextResponse.json({ detections });
  } catch (error) {
    console.error('Error fetching detections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch detections' },
      { status: 500 }
    );
  }
}

// POST - 创建新的检测记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, imageUrl, ocrResult, ingredients, safetyAnalysis, riskLevel } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const detection = await DatabaseService.createDetection({
      userId,
      imageUrl,
      ocrResult,
      ingredients,
      safetyAnalysis,
      riskLevel,
      isProcessed: true
    });

    return NextResponse.json({ detection }, { status: 201 });
  } catch (error) {
    console.error('Error creating detection:', error);
    return NextResponse.json(
      { error: 'Failed to create detection' },
      { status: 500 }
    );
  }
}
