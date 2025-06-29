// OCR服务通用配置
// 环境变量配置在项目根目录的.env文件中

export interface OCRConfig {
  apiKey: string;
  apiSecret: string;
  apiUrl?: string;
  provider: string;
}

const config: OCRConfig = {
  apiKey: process.env.BAIDU_OCR_API_KEY || '',
  apiSecret: process.env.BAIDU_OCR_SECRET_KEY || '',
  apiUrl: 'https://aip.baidubce.com/rest/2.0/ocr/v1/general_basic',
  provider: 'baidu'
};

export default config;
