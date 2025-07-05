// 用户识别服务
import { store } from '../store';
import { initializeUser, updateFingerprint } from '../store/userSlice';
import { UserIdentity } from '../types/user';

export class UserService {
  private static instance: UserService;
  private initialized = false;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * 初始化用户识别服务
   */
  async initialize(): Promise<UserIdentity | null> {
    if (this.initialized) {
      return this.getCurrentUser();
    }

    try {
      const result = await store.dispatch(initializeUser());
      
      if (initializeUser.fulfilled.match(result)) {
        this.initialized = true;
        this.setupPeriodicUpdate();
        return result.payload;
      } else {
        console.error('Failed to initialize user:', result.payload);
        return null;
      }
    } catch (error) {
      console.error('Error initializing user service:', error);
      return null;
    }
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): UserIdentity | null {
    const state = store.getState();
    return state.user.identity;
  }

  /**
   * 获取用户UID
   */
  getUserUID(): string | null {
    const user = this.getCurrentUser();
    return user?.uid || null;
  }

  /**
   * 检查用户是否已初始化
   */
  isInitialized(): boolean {
    const state = store.getState();
    return state.user.initialized;
  }

  /**
   * 检查是否正在加载
   */
  isLoading(): boolean {
    const state = store.getState();
    return state.user.isLoading;
  }

  /**
   * 获取错误信息
   */
  getError(): string | null {
    const state = store.getState();
    return state.user.error;
  }

  /**
   * 手动更新用户指纹
   */
  async updateUserFingerprint(): Promise<UserIdentity | null> {
    try {
      const result = await store.dispatch(updateFingerprint());
      
      if (updateFingerprint.fulfilled.match(result)) {
        return result.payload;
      } else {
        console.error('Failed to update fingerprint:', result.payload);
        return null;
      }
    } catch (error) {
      console.error('Error updating fingerprint:', error);
      return null;
    }
  }

  /**
   * 设置定期更新指纹
   */
  private setupPeriodicUpdate(): void {
    // 每30分钟更新一次指纹信息
    setInterval(() => {
      this.updateUserFingerprint();
    }, 30 * 60 * 1000);

    // 监听页面可见性变化，当页面重新可见时更新指纹
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateUserFingerprint();
      }
    });

    // 监听在线状态变化
    window.addEventListener('online', () => {
      this.updateUserFingerprint();
    });
  }

  /**
   * 获取用户统计信息
   */
  getUserStats() {
    const user = this.getCurrentUser();
    if (!user) return null;

    return {
      uid: user.uid,
      createdAt: new Date(user.createdAt).toLocaleString(),
      lastSeen: new Date(user.lastSeen).toLocaleString(),
      sessionCount: user.sessionCount,
      fingerprint: {
        platform: user.fingerprint.platform,
        language: user.fingerprint.language,
        timezone: user.fingerprint.timezone,
        screenResolution: user.fingerprint.screenResolution,
        onLine: user.fingerprint.onLine
      }
    };
  }

  /**
   * 清除用户数据
   */
  clearUserData(): void {
    store.dispatch({ type: 'user/clearUser' });
    this.initialized = false;
  }
}

// 导出单例实例
export const userService = UserService.getInstance();
