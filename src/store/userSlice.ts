// Redux用户状态管理
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UserState, UserIdentity, BrowserFingerprint } from '../types/user';
import { FingerprintCollector } from '../lib/fingerprint';
import { UIDGenerator } from '../lib/uid-generator';

// 初始状态
const initialState: UserState = {
  identity: null,
  isLoading: false,
  error: null,
  initialized: false
};

// 异步操作：初始化用户身份
export const initializeUser = createAsyncThunk(
  'user/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // 生成或获取UID
      const uid = await UIDGenerator.generateOrRetrieveUID();

      // 收集当前指纹
      const fingerprint = await FingerprintCollector.collect();

      // 获取或创建用户身份
      const existingIdentity = getStoredIdentity();

      if (existingIdentity && existingIdentity.uid === uid) {
        // 更新现有身份的最后访问时间和会话计数
        const updatedIdentity: UserIdentity = {
          ...existingIdentity,
          fingerprint,
          lastSeen: Date.now(),
          sessionCount: existingIdentity.sessionCount + 1
        };

        // 同步到数据库（通过API调用）
        if (typeof window !== 'undefined') {
          try {
            await fetch('/api/users/activity', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uid, fingerprint })
            });
          } catch (dbError) {
            console.warn('Failed to sync user data to database:', dbError);
          }
        }

        storeIdentity(updatedIdentity);
        return updatedIdentity;
      } else {
        // 创建新的用户身份
        const newIdentity: UserIdentity = {
          uid,
          fingerprint,
          createdAt: Date.now(),
          lastSeen: Date.now(),
          sessionCount: 1
        };

        // 同步到数据库（通过API调用）
        if (typeof window !== 'undefined') {
          try {
            await fetch('/api/users', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ uid, fingerprint })
            });
          } catch (dbError) {
            console.warn('Failed to create user in database:', dbError);
          }
        }

        storeIdentity(newIdentity);
        return newIdentity;
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to initialize user');
    }
  }
);

// 异步操作：更新用户指纹
export const updateFingerprint = createAsyncThunk(
  'user/updateFingerprint',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { user: UserState };
      const currentIdentity = state.user.identity;
      
      if (!currentIdentity) {
        throw new Error('No user identity found');
      }
      
      // 收集新的指纹
      const newFingerprint = await FingerprintCollector.collect();
      
      // 更新身份信息
      const updatedIdentity: UserIdentity = {
        ...currentIdentity,
        fingerprint: newFingerprint,
        lastSeen: Date.now()
      };
      
      storeIdentity(updatedIdentity);
      return updatedIdentity;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update fingerprint');
    }
  }
);

// 用户slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.identity = null;
      state.error = null;
      state.initialized = false;
      UIDGenerator.clearUserData();
      clearStoredIdentity();
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 初始化用户
      .addCase(initializeUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(initializeUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.identity = action.payload;
        state.initialized = true;
        state.error = null;
      })
      .addCase(initializeUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.initialized = true;
      })
      // 更新指纹
      .addCase(updateFingerprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFingerprint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.identity = action.payload;
        state.error = null;
      })
      .addCase(updateFingerprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

// 辅助函数：存储用户身份
function storeIdentity(identity: UserIdentity): void {
  try {
    localStorage.setItem('foodsafety_user_identity', JSON.stringify(identity));
  } catch (error) {
    console.warn('Failed to store user identity:', error);
  }
}

// 辅助函数：获取存储的用户身份
function getStoredIdentity(): UserIdentity | null {
  try {
    const stored = localStorage.getItem('foodsafety_user_identity');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// 辅助函数：清除存储的用户身份
function clearStoredIdentity(): void {
  try {
    localStorage.removeItem('foodsafety_user_identity');
  } catch (error) {
    console.warn('Failed to clear user identity:', error);
  }
}

export const { clearUser, setError, clearError } = userSlice.actions;
export default userSlice.reducer;
