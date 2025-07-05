// 用户相关类型定义

export interface BrowserFingerprint {
  // 设备信息
  screenResolution: string;
  screenColorDepth: number;
  timezone: string;
  language: string;
  languages: string[];
  platform: string;
  
  // 浏览器信息
  userAgent: string;
  vendor: string;
  cookieEnabled: boolean;
  doNotTrack: string | null;
  
  // 网络信息
  connectionType?: string;
  effectiveType?: string;
  onLine: boolean;
  
  // 硬件信息
  hardwareConcurrency: number;
  deviceMemory?: number;
  
  // 功能支持
  webGL: boolean;
  canvas: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  
  // 时间戳
  timestamp: number;
}

export interface UserIdentity {
  uid: string;
  fingerprint: BrowserFingerprint;
  createdAt: number;
  lastSeen: number;
  sessionCount: number;
}

export interface UserState {
  identity: UserIdentity | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
}
