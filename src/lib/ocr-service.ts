import axios from 'axios';
import ocrConfig from '@/config/ocr.config';

interface OCRResult {
  words_result: Array<{
    words: string;
  }>;
  words_result_num: number;
}

export class OCRService {
  private static instance: OCRService;
  private accessToken = '';
  private provider: string;

  private constructor() {
    if (!ocrConfig.apiKey || !ocrConfig.apiSecret) {
      throw new Error('OCR API配置不完整');
    }
    this.provider = ocrConfig.provider;
  }

  public static getInstance(): OCRService {
    if (!OCRService.instance) {
      OCRService.instance = new OCRService();
    }
    return OCRService.instance;
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    const response = await axios.post(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${ocrConfig.apiKey}&client_secret=${ocrConfig.apiSecret}`
    );
    this.accessToken = response.data.access_token;
    return this.accessToken;
  }

  public async recognize(imageData: string): Promise<string> {
    const token = await this.getAccessToken();
    const base64Data = imageData.split(';base64,').pop() || imageData;

    const response = await axios.post(
      `https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic?access_token=${token}`,
      {
        image: base64Data,
        detect_direction: 'false',
        paragraph: 'false',
        probability: 'false',
        multidirectional_recognize: 'false'
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    const result: OCRResult = response.data;
    return result.words_result?.map(item => item.words).join('\n') || '';
  }
}
