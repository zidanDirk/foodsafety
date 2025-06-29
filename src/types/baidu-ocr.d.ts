declare module '../../config/baidu-ocr.config' {
  interface BaiduOcrConfig {
    apiKey: string;
    secretKey: string;
    apiUrl?: string;
  }

  const config: BaiduOcrConfig;
  export default config;
}
