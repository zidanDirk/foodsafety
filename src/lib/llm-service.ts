import OpenAI from "openai";
import llmConfig from '@/config/llm.config';

interface LLMRequest {
  model: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
}

interface LLMResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason?: string;
  }>;
}

export class LLMService {
  private static instance: LLMService;
  private client: OpenAI;
  private model: string;

  private constructor() {
    if (!llmConfig.apiKey) {
      throw new Error('LLM API配置不完整');
    }
    this.client = new OpenAI({
      baseURL: llmConfig.apiUrl,
      apiKey: llmConfig.apiKey
    });
    this.model = llmConfig.model || 'deepseek-chat';
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  public async chatCompletion(request: LLMRequest): Promise<LLMResponse> {
    const completion = await this.client.chat.completions.create({
      ...request,
      model: request.model || this.model
    });

    return {
      choices: completion.choices.map((choice: any) => ({
        message: {
          content: choice.message.content || ''
        },
        finish_reason: choice.finish_reason
      }))
    };
  }

  public async analyzeIngredients(text: string): Promise<string> {
    const response = await this.chatCompletion({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `# Role：食品成分分析专家

## Role Profile:
- 语言：中文
- 描述：你是一位专业的食品成分分析专家，专注于从食品相关文本中准确提取和验证配料成分

## Goals:
- 从用户提供的文本中提取所有配料成分
- 检查每种配料是否存在错别字并自动纠正
- 返回用"｜"符号分隔的准确成分列表

## Skills:
1. 精通食品科学和常见食品成分
2. 能够识别和纠正食品成分中的常见错别字
3. 熟悉各种食品添加剂和原料的规范名称
4. 能够区分有效成分和非成分文本

## Workflow:
1. 接收用户提供的食品成分文本
2. 分析文本并识别所有可能的成分
3. 验证每个成分是否存在错别字并自动纠正
4. 过滤掉非成分文本
5. 返回用"｜"分隔的准确成分列表

## Examples:
输入：黑米、赤藓糖醇、黑芝麻、黑豆、黑桑椹、纯化魔芋微粉、黑果枸杞
输出：黑米｜赤藓糖醇｜黑芝麻｜黑豆｜黑桑椹｜纯化魔芋微粉｜黑果枸杞

输入：黑米、赤鲜糖醇、黑芝麻、黑豆、黑桑甚
输出：黑米｜赤藓糖醇｜黑芝麻｜黑豆｜黑桑椹`
        },
        {
          role: 'user',
          content: `请分析以下食品成分：${text}`
        }
      ],
      temperature: 0
    });
    
    // 移除可能的代码块标记并返回纯文本
    return response.choices[0].message.content
      .replace(/```/g, '')
      .trim();
  }
}
