
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryable = error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('503');
      if (retries <= 0 || !isRetryable) {
        if (error.message?.includes('429')) {
          throw new Error("AI 智算配额已耗尽，请稍后再试或检查 API 账单。");
        }
        if (error.message?.includes('API_KEY_MISSING')) {
          throw new Error("检测到密钥配置缺失，请在环境设置中配置有效 API_KEY。");
        }
        if (!navigator.onLine) {
          throw new Error("网络似乎已断开，请检查网络连接。");
        }
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.withRetry(fn, retries - 1, delay * 2);
    }
  }

  /**
   * 核心对话功能，集成实时搜索
   */
  public async chat(message: string, history: { role: 'user' | 'model'; parts: { text: string }[] }[] = []) {
    return await this.withRetry(async () => {
      // 每次调用创建新实例，确保获取最新环境变量
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contents = [...history, { role: 'user', parts: [{ text: message }] }];

      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: contents as any,
        config: {
          systemInstruction: `你是一个专业的财富管理助手，名为“日斗 AI 逻辑专家”。
你的核心任务是：
1. 分析全球核心资产（股票、债券、宏观经济）。
2. 提供深度的产业逻辑拆解。
3. 保持专业、严谨、客观的语调。
4. 使用 Markdown 格式。
5. 你拥有实时搜索能力，必须结合最新的市场数据回答。
6. 回答结尾必须包含免责声明：“注：以上分析仅供逻辑交流，不构成投资建议。投资有风险，入市需谨慎。”`,
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "抱歉，由于逻辑波动，暂时无法生成分析。";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      let finalResponse = text;
      if (chunks && chunks.length > 0) {
        const sources = Array.from(new Set(chunks
          .filter(c => c.web)
          .map(c => `[${c.web.title}](${c.web.uri})`)))
          .join('; ');
        
        if (sources) {
          finalResponse += `\n\n---\n**实时研报来源：**\n${sources}`;
        }
      }

      return {
        text: finalResponse,
        history: [...contents, { role: 'model', parts: [{ text: text }] }]
      };
    });
  }
}
