import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '../../../../src/lib/database-service';

export async function POST(request: NextRequest) {
  try {
    const { uid, fingerprint } = await request.json();

    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }

    // 更新用户活动和指纹
    await DatabaseService.updateUserActivity(uid);
    if (fingerprint) {
      await DatabaseService.updateUserFingerprint(uid, fingerprint);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user activity:', error);
    return NextResponse.json(
      { error: 'Failed to update user activity' },
      { status: 500 }
    );
  }
}
