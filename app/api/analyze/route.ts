import { LLMService } from '@/lib/llm-service';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    
    if (!text) {
      return new Response(JSON.stringify({
        error: '未提供文本数据'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }

    console.log('初始化LLM服务...');
    const llmService = LLMService.getInstance();
    console.log('开始分析配料...');

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const encoder = new TextEncoder();
          const generator = llmService.analyzeIngredients(text);
          
          for await (const chunk of generator) {
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error('LLM分析错误:', error);
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode(JSON.stringify({
            error: '配料分析失败'
          })));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('API处理错误:', error);
    return new Response(JSON.stringify({
      error: '服务器处理请求时出错'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
