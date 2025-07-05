import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../src/lib/database-service';

// GET - 获取用户信息和统计
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get('uid');

    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }

    const user = await DatabaseService.getUserByUid(uid);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const stats = await DatabaseService.getUserStats(user.id);
    return NextResponse.json({ user, stats });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// POST - 创建或更新用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, fingerprint } = body;

    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }

    // 检查用户是否已存在
    const existingUser = await DatabaseService.getUserByUid(uid);
    
    if (existingUser) {
      // 更新用户活动和指纹
      await DatabaseService.updateUserActivity(uid);
      if (fingerprint) {
        await DatabaseService.updateUserFingerprint(uid, fingerprint);
      }
      
      const updatedUser = await DatabaseService.getUserByUid(uid);
      return NextResponse.json({ user: updatedUser });
    } else {
      // 创建新用户
      const newUser = await DatabaseService.createUser({
        uid,
        fingerprint
      });
      
      return NextResponse.json({ user: newUser }, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return NextResponse.json(
      { error: 'Failed to create/update user' },
      { status: 500 }
    );
  }
}
