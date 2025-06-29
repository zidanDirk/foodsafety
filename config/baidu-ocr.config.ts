// 百度OCR API配置
// 环境变量配置在项目根目录的.env文件中

export interface BaiduOcrConfig {
  apiKey: string;
  secretKey: string;
  apiUrl?: string;
}

const config: BaiduOcrConfig = {
  apiKey: process.env.BAIDU_OCR_API_KEY || '',
  secretKey: process.env.BAIDU_OCR_SECRET_KEY || '',
  apiUrl: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic'
};

export default config;
