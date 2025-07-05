// UID生成和管理工具
import { v4 as uuidv4 } from 'uuid';
import { BrowserFingerprint } from '../types/user';
import { FingerprintCollector } from './fingerprint';

export class UIDGenerator {
  private static readonly UID_PREFIX = 'fs_user_';
  private static readonly STORAGE_KEY = 'foodsafety_user_uid';
  private static readonly FINGERPRINT_KEY = 'foodsafety_user_fingerprint';

  /**
   * 生成或获取用户UID
   */
  static async generateOrRetrieveUID(): Promise<string> {
    // 首先尝试从本地存储获取现有UID
    const existingUID = this.getStoredUID();
    if (existingUID) {
      // 验证现有UID是否仍然有效
      const isValid = await this.validateUID(existingUID);
      if (isValid) {
        return existingUID;
      }
    }

    // 生成新的UID
    return this.generateNewUID();
  }

  /**
   * 生成新的UID
   */
  private static async generateNewUID(): Promise<string> {
    const fingerprint = await FingerprintCollector.collect();
    const fingerprintHash = FingerprintCollector.generateHash(fingerprint);
    
    // 结合指纹哈希和随机UUID生成唯一标识
    const randomPart = uuidv4().replace(/-/g, '').substring(0, 8);
    const uid = `${this.UID_PREFIX}${fingerprintHash}_${randomPart}`;
    
    // 存储UID和指纹信息
    this.storeUID(uid);
    this.storeFingerprint(fingerprint);
    
    return uid;
  }

  /**
   * 验证UID有效性
   */
  private static async validateUID(uid: string): Promise<boolean> {
    try {
      // 获取当前指纹
      const currentFingerprint = await FingerprintCollector.collect();
      const currentHash = FingerprintCollector.generateHash(currentFingerprint);
      
      // 获取存储的指纹
      const storedFingerprint = this.getStoredFingerprint();
      if (!storedFingerprint) {
        return false;
      }
      
      const storedHash = FingerprintCollector.generateHash(storedFingerprint);
      
      // 计算指纹相似度
      const similarity = this.calculateFingerprintSimilarity(currentFingerprint, storedFingerprint);
      
      // 如果相似度超过阈值，认为是同一用户
      return similarity > 0.8;
    } catch {
      return false;
    }
  }

  /**
   * 计算指纹相似度
   */
  private static calculateFingerprintSimilarity(
    current: BrowserFingerprint, 
    stored: BrowserFingerprint
  ): number {
    const weights = {
      screenResolution: 0.15,
      timezone: 0.1,
      language: 0.1,
      platform: 0.15,
      userAgent: 0.2,
      hardwareConcurrency: 0.1,
      deviceMemory: 0.05,
      webGL: 0.05,
      canvas: 0.05,
      localStorage: 0.05
    };

    let totalWeight = 0;
    let matchedWeight = 0;

    // 比较各个字段
    Object.entries(weights).forEach(([key, weight]) => {
      totalWeight += weight;
      if (current[key as keyof BrowserFingerprint] === stored[key as keyof BrowserFingerprint]) {
        matchedWeight += weight;
      }
    });

    return matchedWeight / totalWeight;
  }

  /**
   * 存储UID到本地存储
   */
  private static storeUID(uid: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, uid);
      sessionStorage.setItem(this.STORAGE_KEY, uid);
    } catch (error) {
      console.warn('Failed to store UID:', error);
    }
  }

  /**
   * 从本地存储获取UID
   */
  private static getStoredUID(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY) || 
             sessionStorage.getItem(this.STORAGE_KEY);
    } catch {
      return null;
    }
  }

  /**
   * 存储指纹信息
   */
  private static storeFingerprint(fingerprint: BrowserFingerprint): void {
    try {
      localStorage.setItem(this.FINGERPRINT_KEY, JSON.stringify(fingerprint));
    } catch (error) {
      console.warn('Failed to store fingerprint:', error);
    }
  }

  /**
   * 获取存储的指纹信息
   */
  private static getStoredFingerprint(): BrowserFingerprint | null {
    try {
      const stored = localStorage.getItem(this.FINGERPRINT_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * 清除存储的用户数据
   */
  static clearUserData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.FINGERPRINT_KEY);
      sessionStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear user data:', error);
    }
  }

  /**
   * 获取用户统计信息
   */
  static getUserStats(): { hasStoredUID: boolean; hasStoredFingerprint: boolean } {
    return {
      hasStoredUID: !!this.getStoredUID(),
      hasStoredFingerprint: !!this.getStoredFingerprint()
    };
  }
}
