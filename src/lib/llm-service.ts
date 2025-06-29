import OpenAI from "openai";
import llmConfig from '@/config/llm.config';
import { ingredientItem } from "../types/ingredients";

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

  public async analyzeIngredients(text: string): Promise<Array<ingredientItem>> {
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
- 返回详细的成分分析结果

## Skills:
1. 精通食品科学和常见食品成分
2. 能够识别和纠正食品成分中的常见错别字
3. 熟悉各种食品添加剂和原料的规范名称
4. 能够区分有效成分和非成分文本
5. 能用通俗易懂的语言解释成分特性

## Workflow:
1. 接收用户提供的食品成分文本
2. 分析文本并识别所有可能的成分
3. 验证每个成分是否存在错别字并自动纠正
4. 过滤掉非成分文本
5. 为每个成分生成详细描述和健康评估
6. 返回JSON数组格式的结果

## Examples:
输入：黑米、赤藓糖醇、黑芝麻、黑豆、黑桑椹
输出：[
  {
    "name": "黑米",
    "description": "一种颜色呈紫黑色的米，比普通白米更有营养...",
    "is_healthy": "是",
    "health_reason": "富含膳食纤维、花青素和多种矿物质..."
  },
  {
    "name": "赤藓糖醇",
    "description": "一种天然的甜味剂...",
    "is_healthy": "是",
    "health_reason": "相比普通糖，它几乎不含热量..."
  }
]`
        },
        {
          role: 'user',
          content: `请分析以下食品成分：${text}`
        }
      ],
      temperature: 0
    });
    console.log(22233, response.choices[0].message.content)
    const content = response.choices[0].message.content;
    // 处理可能的代码块标记
    const cleanedContent = content.replace(/```(json)?/g, '').trim();
    return JSON.parse(cleanedContent);
  }
}
