// 浏览器指纹收集工具
import { BrowserFingerprint } from '../types/user';

export class FingerprintCollector {
  /**
   * 收集浏览器指纹信息
   */
  static async collect(): Promise<BrowserFingerprint> {
    const fingerprint: BrowserFingerprint = {
      // 设备信息
      screenResolution: `${screen.width}x${screen.height}`,
      screenColorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      languages: Array.from(navigator.languages),
      platform: navigator.platform,
      
      // 浏览器信息
      userAgent: navigator.userAgent,
      vendor: navigator.vendor || '',
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack,
      
      // 网络信息
      onLine: navigator.onLine,
      
      // 硬件信息
      hardwareConcurrency: navigator.hardwareConcurrency,
      
      // 功能支持检测
      webGL: this.detectWebGL(),
      canvas: this.detectCanvas(),
      localStorage: this.detectLocalStorage(),
      sessionStorage: this.detectSessionStorage(),
      indexedDB: this.detectIndexedDB(),
      
      // 时间戳
      timestamp: Date.now()
    };

    // 网络连接信息（如果支持）
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      fingerprint.connectionType = connection?.type;
      fingerprint.effectiveType = connection?.effectiveType;
    }

    // 设备内存信息（如果支持）
    if ('deviceMemory' in navigator) {
      fingerprint.deviceMemory = (navigator as any).deviceMemory;
    }

    return fingerprint;
  }

  /**
   * 检测WebGL支持
   */
  private static detectWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch {
      return false;
    }
  }

  /**
   * 检测Canvas支持
   */
  private static detectCanvas(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext && canvas.getContext('2d'));
    } catch {
      return false;
    }
  }

  /**
   * 检测localStorage支持
   */
  private static detectLocalStorage(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检测sessionStorage支持
   */
  private static detectSessionStorage(): boolean {
    try {
      const test = '__test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 检测IndexedDB支持
   */
  private static detectIndexedDB(): boolean {
    return !!(window.indexedDB || (window as any).mozIndexedDB || 
              (window as any).webkitIndexedDB || (window as any).msIndexedDB);
  }

  /**
   * 生成指纹哈希值
   */
  static generateHash(fingerprint: BrowserFingerprint): string {
    // 创建指纹字符串
    const fingerprintString = [
      fingerprint.screenResolution,
      fingerprint.screenColorDepth,
      fingerprint.timezone,
      fingerprint.language,
      fingerprint.languages.join(','),
      fingerprint.platform,
      fingerprint.userAgent,
      fingerprint.vendor,
      fingerprint.cookieEnabled,
      fingerprint.doNotTrack,
      fingerprint.connectionType,
      fingerprint.effectiveType,
      fingerprint.hardwareConcurrency,
      fingerprint.deviceMemory,
      fingerprint.webGL,
      fingerprint.canvas,
      fingerprint.localStorage,
      fingerprint.sessionStorage,
      fingerprint.indexedDB
    ].join('|');

    // 简单哈希算法
    return this.simpleHash(fingerprintString);
  }

  /**
   * 简单哈希算法
   */
  private static simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }
}
