// 大语言模型通用配置
// 环境变量配置在项目根目录的.env文件中

export interface LLMConfig {
  apiKey: string;
  apiUrl?: string;
  model?: string;
  provider: string;
}

const config: LLMConfig = {
  apiKey: process.env.LLM_API_KEY || '',
  apiUrl: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  provider: 'deepseek'
};

export default config;
